import apiClient from "../../../services/apiClient";

export interface Blog {
  blog_id: number;
  author_id: number;
  title: string;
  content: string;
  publication_date?: string;
  like_count?: number;
}

export interface Comment {
  cmnt_id: number;
  blog_id: number;
  user_id: number;
  content: string;
  date_posted?: string;
}

export interface BlogDetails {
  blog: Blog;
  comments: Comment[];
  user_liked: boolean;
}

export const blogService = {
  getAll: () => apiClient.get<Blog[]>("/blogs"),
  getMine: () => apiClient.get<Blog[]>("/blogs/me"),
  getById: (id: number) => apiClient.get<BlogDetails>(`/blogs/${id}`),
  create: (data: { title: string; content: string }) => apiClient.post<Blog>("/blogs", data),
  update: (id: number, data: { title: string; content: string }) =>
    apiClient.put<Blog>(`/blogs/${id}`, data),
  remove: (id: number) => apiClient.delete(`/blogs/${id}`),
  toggleLike: (id: number) => apiClient.post(`/blogs/${id}/like`),
  addComment: (id: number, data: { content: string }) =>
    apiClient.post<Comment>(`/blogs/${id}/comments`, data),
};
