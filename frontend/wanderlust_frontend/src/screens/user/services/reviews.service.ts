import apiClient from "../../../services/apiClient";

export interface Review {
  review_id: number;
  dest_id: number;
  rating: number;
  content: string;
  user_id: number;
  review_date?: string;
}

export interface ReviewCreate {
  dest_id: number;
  rating: number;
  content: string;
}

export interface ReviewUpdate {
  rating: number;
  content: string;
}

const reviewsService = {
  list: () => apiClient.get<Review[]>("/reviews/"),
  create: (data: ReviewCreate) => apiClient.post<Review>("/reviews/", data),
  update: (reviewId: number, data: ReviewUpdate) =>
    apiClient.put<Review>(`/reviews/${reviewId}`, data),
  delete: (reviewId: number) => apiClient.delete(`/reviews/${reviewId}`),
};

export default reviewsService;
