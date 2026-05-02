import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Popconfirm, Space, Spin, Typography, message } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { blogService, type Blog } from "../blogs/services/blog.service";

const { TextArea } = Input;

const BlogAuthorDashboard = () => {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
	const [form] = Form.useForm();

	const loadBlogs = async () => {
		setLoading(true);
		try {
			const res = await blogService.getMine();
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

	const openCreate = () => {
		setEditingBlog(null);
		form.resetFields();
	};

	const openEdit = (blog: Blog) => {
		setEditingBlog(blog);
		form.setFieldsValue({ title: blog.title, content: blog.content });
	};

	const submit = async (values: { title: string; content: string }) => {
		setSaving(true);
		try {
			if (editingBlog) {
				const res = await blogService.update(editingBlog.blog_id, values);
				setBlogs((items) => items.map((item) => (item.blog_id === res.data.blog_id ? res.data : item)));
				message.success("Blog updated");
			} else {
				const res = await blogService.create(values);
				setBlogs((items) => [res.data, ...items]);
				message.success("Blog published");
			}
			form.resetFields();
			setEditingBlog(null);
		} catch (error: any) {
			message.error(error.response?.data?.detail ?? "Failed to save blog");
		} finally {
			setSaving(false);
		}
	};

	const remove = async (blogId: number) => {
		try {
			await blogService.remove(blogId);
			setBlogs((items) => items.filter((item) => item.blog_id !== blogId));
			message.success("Blog deleted");
		} catch (error: any) {
			message.error(error.response?.data?.detail ?? "Failed to delete blog");
		}
	};

	return (
		<div className="min-h-full bg-slate-50 p-4 sm:p-6">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<Typography.Title level={2} style={{ marginBottom: 4 }}>Blog Author</Typography.Title>
						<Typography.Text type="secondary">Create, edit, and manage your published stories.</Typography.Text>
					</div>
					<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
						New Blog
					</Button>
				</div>

				<Card>
					<Form form={form} layout="vertical" onFinish={submit} initialValues={{ title: "", content: "" }}>
						<Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
							<Input placeholder="Enter a strong headline" />
						</Form.Item>
						<Form.Item name="content" label="Content" rules={[{ required: true, message: "Content is required" }]}>
							<TextArea rows={8} placeholder="Write your blog post" />
						</Form.Item>
						<Space>
							<Button type="primary" htmlType="submit" loading={saving}>
								{editingBlog ? "Update Blog" : "Publish Blog"}
							</Button>
							{editingBlog ? <Button onClick={openCreate}>Cancel Edit</Button> : null}
						</Space>
					</Form>
				</Card>

				{loading ? (
					<div className="flex justify-center py-12"><Spin size="large" /></div>
				) : (
					<div className="grid gap-4">
						{blogs.map((blog) => (
							<Card key={blog.blog_id} className="shadow-sm">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div className="space-y-2">
										<Typography.Title level={4} style={{ marginBottom: 0 }}>{blog.title}</Typography.Title>
										<Typography.Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 0 }}>
											{blog.content}
										</Typography.Paragraph>
									</div>
									<Space>
										<Button icon={<EditOutlined />} onClick={() => openEdit(blog)}>Edit</Button>
										<Popconfirm title="Delete this blog?" onConfirm={() => remove(blog.blog_id)}>
											<Button danger icon={<DeleteOutlined />}>Delete</Button>
										</Popconfirm>
									</Space>
								</div>
							</Card>
						))}
						{blogs.length === 0 ? <Card>No blogs yet. Publish your first post above.</Card> : null}
					</div>
				)}
			</div>
		</div>
	);
};

export default BlogAuthorDashboard;
