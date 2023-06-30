import React from "react";
import {
    useDataGrid,
    EditButton,
    ShowButton,
    DeleteButton,
    List,
    DateField,
} from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
    useTranslate,
    useMany,
    useOne
} from "@refinedev/core";
import { Checkbox } from "@mui/material";
import { authProvider } from "src/authProvider"
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function PostList() {
    const translate = useTranslate();
    const { dataGridProps } = useDataGrid();

    const { data: categoryData, isLoading: categoryIsLoading } = useMany({
        resource: "category",
        ids: dataGridProps?.rows?.map((item: any) => item?.category_id) ?? [],
    });

    const { data: ownerData, isLoading: ownerIsLoading } = useOne({
        resource: "users",
        id: dataGridProps?.rows?.map((item: any) => item?.owner_id) ?? [],
    });

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: "id",
                headerName: translate("id"),
                minWidth: 50,
            },
            {
                field: "category_id",
                flex: 1,
                headerName: translate("category"),
                minWidth: 300,
            },
            {
                field: "title",
                flex: 1,
                headerName: translate("title"),
                minWidth: 200,
            },
            {
                field: "description",
                flex: 1,
                headerName: translate("description"),
                minWidth: 200,
            },
            {
                field: "created_at",
                flex: 1,
                headerName: translate("created_at"),
                minWidth: 250,
                renderCell: function render({ value }) {
                    return <DateField value={value} />;
                },
            },
            {
                field: "updated_at",
                flex: 1,
                headerName: translate("updated at"),
                minWidth: 250,
                renderCell: function render({ value }) {
                    return <DateField value={value} />;
                },
            },
            {
                field: "attachment",
                flex: 1,
                headerName: translate("attachment"),
                minWidth: 200,
            },
            {
                field: "approved",
                headerName: translate("approved"),
                minWidth: 100,
                renderCell: function render({ value }) {
                    return <Checkbox checked={!!value} />;
                },
            },
            {
                field: "actions",
                headerName: translate("table.actions"),
                sortable: false,
                renderCell: function render({ row }) {
                    return (
                        <>
                            <EditButton hideText recordItemId={row.id} />
                            <ShowButton hideText recordItemId={row.id} />
                            <DeleteButton hideText recordItemId={row.id} />
                        </>
                    );
                },
                align: "center",
                headerAlign: "center",
                minWidth: 80,
            },
        ],
        [translate, categoryData?.data, ownerData?.data],
    );

    return (
        <List>
            <DataGrid {...dataGridProps} columns={columns} autoHeight />
        </List>
    );
};

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const { authenticated, redirectTo } = await authProvider.check(context);

  const translateProps = await serverSideTranslations(context.locale ?? "en", [
    "common",
  ]);

  if (!authenticated) {
    return {
      props: {
        ...translateProps,
      },
      redirect: {
        destination: `${redirectTo}?to=${encodeURIComponent("/posts")}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...translateProps,
    },
  };
};
