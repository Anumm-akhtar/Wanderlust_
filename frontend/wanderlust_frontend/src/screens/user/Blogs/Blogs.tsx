import { useEffect, useState } from "react";
import { Button, Card, Form, Input, List, Modal, Spin, Typography, message } from "antd";
import { HeartOutlined, HeartFilled, CommentOutlined } from "@ant-design/icons";
import { blogService, type Blog, type BlogDetails } from "../../blogs/services/blog.service";

const { TextArea } = Input;

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlogDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentForm] = Form.useForm();

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogService.getAll();
      setBlogs(res.data);
    } catch (error: any) {
      message.error(error.response?.data?.detail ?? "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openBlog = async (blogId: number) => {
    setDetailLoading(true);
    try {
      const res = await blogService.getById(blogId);
      setSelected(res.data);
      commentForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.detail ?? "Failed to open blog");
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!selected) return;
    try {
      const res = await blogService.toggleLike(selected.blog.blog_id);
      setSelected({
        ...selected,
        blog: { ...selected.blog, like_count: res.data.likes },
        user_liked: res.data.userLiked,
      });
    } catch (error: any) {
      message.error(error.response?.data?.detail ?? "Failed to update like");
    }
  };

  const addComment = async (values: { content: string }) => {
    if (!selected) return;
    setCommenting(true);
    try {
      const res = await blogService.addComment(selected.blog.blog_id, values);
      setSelected({
        ...selected,
        comments: [res.data, ...selected.comments],
      });
      commentForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.detail ?? "Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Typography.Title level={2} style={{ marginBottom: 4 }}>Blogs</Typography.Title>
          <Typography.Text type="secondary">Read travel stories, react, and join the discussion.</Typography.Text>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spin size="large" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <Card
                key={blog.blog_id}
                hoverable
                className="shadow-sm"
                onClick={() => openBlog(blog.blog_id)}
              >
                <Typography.Title level={4} ellipsis style={{ marginBottom: 8 }}>{blog.title}</Typography.Title>
                <Typography.Paragraph ellipsis={{ rows: 4 }} style={{ marginBottom: 0 }}>
                  {blog.content}
                </Typography.Paragraph>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>{blog.like_count ?? 0} likes</span>
                  <span>Open to read</span>
                </div>
              </Card>
            ))}
            {blogs.length === 0 ? <Card>No blogs available yet.</Card> : null}
          </div>
        )}
      </div>

      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={900}
        title={selected?.blog.title ?? "Blog details"}
      >
        {detailLoading || !selected ? (
          <div className="flex justify-center py-12"><Spin size="large" /></div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <Typography.Paragraph className="text-slate-700 whitespace-pre-wrap">
                {selected.blog.content}
              </Typography.Paragraph>
              <Button
                type={selected.user_liked ? "default" : "primary"}
                icon={selected.user_liked ? <HeartFilled /> : <HeartOutlined />}
                onClick={toggleLike}
              >
                {selected.blog.like_count ?? 0}
              </Button>
            </div>

            <div className="space-y-3">
              <Typography.Title level={5} style={{ marginBottom: 0 }}>Comments</Typography.Title>
              <Form form={commentForm} onFinish={addComment} layout="vertical">
                <Form.Item name="content" rules={[{ required: true, message: "Comment is required" }]}>
                  <TextArea rows={4} placeholder="Write a comment" />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<CommentOutlined />} loading={commenting}>
                  Post Comment
                </Button>
              </Form>

              <List
                dataSource={selected.comments}
                locale={{ emptyText: "No comments yet" }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`User #${item.user_id}`}
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Blogs;