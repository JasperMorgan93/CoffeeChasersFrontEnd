import { apiRequest } from './client';
import type {
  ApiDeleteResponse,
  CreateReviewPayload,
  Review,
  UpdateReviewPayload
} from '../types/api';

export const createReview = (payload: CreateReviewPayload) =>
  apiRequest<Review>('/reviews/', { method: 'POST', body: payload });

export const getReviewById = (reviewId: number) => apiRequest<Review>(`/reviews/${reviewId}`);

export const updateReview = (reviewId: number, payload: UpdateReviewPayload) =>
  apiRequest<Review>(`/reviews/${reviewId}`, { method: 'PUT', body: payload });

export const deleteReview = (reviewId: number) =>
  apiRequest<ApiDeleteResponse>(`/reviews/${reviewId}`, { method: 'DELETE' });

export const getReviewsByCustomer = (userId: number) =>
  apiRequest<Review[]>(`/reviews/customer/${userId}`);
