import { apiRequest } from './client';
import type {
  ApiDeleteResponse,
  Cafe,
  CreateCafePayload,
  UpdateCafePayload
} from '../types/api';

export const getCafes = () => apiRequest<Cafe[]>('/cafes/');

export const getCafeById = (cafeId: number) => apiRequest<Cafe>(`/cafes/${cafeId}`);

export const createCafe = (payload: CreateCafePayload) =>
  apiRequest<Cafe>('/cafes/', { method: 'POST', body: payload });

export const updateCafe = (cafeId: number, payload: UpdateCafePayload) =>
  apiRequest<Cafe>(`/cafes/${cafeId}`, { method: 'PUT', body: payload });

export const deleteCafe = (cafeId: number) =>
  apiRequest<ApiDeleteResponse>(`/cafes/${cafeId}`, { method: 'DELETE' });
