import {
  Edit,
  ListButton,
  RefreshButton,
  useForm,
  useSelect,
} from "@refinedev/mui";

import MDEditor from "@uiw/react-md-editor";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { authProvider } from "src/authProvider";

export default function BlogPostCreate() {
  const [isDeprecated, setIsDeprecated] = useState(false);
  const { formProps, saveButtonProps, queryResult } = useForm<IPost>({
      liveMode: "manual",
      onLiveEvent: () => {
          setIsDeprecated(true);
      },
  });

  const postData = queryResult?.data?.data;
  const { selectProps: categorySelectProps } = useSelect<ICategory>({
      resource: "category",
      defaultValue: postData?.categoryId,
  });

  const handleRefresh = () => {
      queryResult?.refetch();
      setIsDeprecated(false);
  };

  return (
      <Edit
          saveButtonProps={saveButtonProps}
          pageHeaderProps={{
              extra: (
                  <>
                      <ListButton />
                      <RefreshButton onClick={handleRefresh} />
                  </>
              ),
          }}
      >
          {isDeprecated && (
              <Alert
                  message="This post is changed. Reload to see it's latest version."
                  type="warning"
                  style={{
                      marginBottom: 20,
                  }}
                  action={
                      <Button
                          onClick={handleRefresh}
                          size="small"
                          type="ghost"
                      >
                          Refresh
                      </Button>
                  }
              />
          )}

          <Form {...formProps} layout="vertical">
              <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                      {
                          required: true,
                      },
                  ]}
              >
                  <Input />
              </Form.Item>
              <Form.Item
                  label="Category"
                  name="categoryId"
                  rules={[
                      {
                          required: true,
                      },
                  ]}
              >
                  <Select {...categorySelectProps} />
              </Form.Item>
              <Form.Item
                  label="Content"
                  name="content"
                  rules={[
                      {
                          required: true,
                      },
                  ]}
              >
                  <MDEditor data-color-mode="light" />
              </Form.Item>
              <Form.Item label="Images">
                  <Form.Item
                      name="images"
                      valuePropName="fileList"
                      normalize={normalizeFile}
                      noStyle
                  >
                      <Upload.Dragger
                          name="file"
                          listType="picture"
                          multiple
                          customRequest={async ({
                              file,
                              onError,
                              onSuccess,
                          }) => {
                              const rcFile = file as RcFile;
                              const fileUrl = `public/${rcFile.name}`;

                              const { error } = await supabaseClient.storage
                                  .from("refine")
                                  .upload(fileUrl, file, {
                                      cacheControl: "3600",
                                      upsert: true,
                                  });

                              if (error) {
                                  return onError?.(error);
                              }
                              const { data, error: urlError } =
                                  await supabaseClient.storage
                                      .from("refine")
                                      .getPublicUrl(fileUrl);

                              if (urlError) {
                                  return onError?.(urlError);
                              }

                              onSuccess?.(
                                  { url: data?.publicUrl },
                                  new XMLHttpRequest(),
                              );
                          }}
                      >
                          <p className="ant-upload-text">
                              Drag & drop a file in this area
                          </p>
                      </Upload.Dragger>
                  </Form.Item>
              </Form.Item>
          </Form>
      </Edit>
  );
}

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
