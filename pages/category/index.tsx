import React from "react";
import {
    useDataGrid,
    EditButton,
    ShowButton,
    DeleteButton,
    List,
} from "@refinedev/mui";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslate, useOne } from "@refinedev/core";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { authProvider } from "src/authProvider";

export default function CategoryList() {
  const translate = useTranslate();
  const { dataGridProps } = useDataGrid();

  const { data: parentData, isLoading: parentIsLoading } = useOne({
    resource: "parent",
    ids: dataGridProps?.rows?.map((item: any) => item?.parent_id) ?? [],
    queryOptions: {
        enabled: !!dataGridProps?.rows,
    },
});

  const columns = React.useMemo<GridColDef[]>(
      () => [
          {
            field: "id",
            headerName: translate("id"),
            minWidth: 50,
      
          },
          {
            field: "global_name",
            headerName: translate("global name"),
            min_width: 200
          },
          {
            field: "name",
            headerName: translate("name"),
            min_width: 200
          },
          {
            field: "parent_id",
            headerName: translate("parent id"),
            min_width: 50
          },
          {
              field: "actions",
              headerName: translate("actions"),
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
      [translate],
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
        destination: `${redirectTo}?to=${encodeURIComponent("/category")}`,
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
