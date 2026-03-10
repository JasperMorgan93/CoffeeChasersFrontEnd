import { apiRequest } from './client';
import type {
  ApiDeleteResponse,
  CreateUserPayload,
  UpdateUserPayload,
  User
} from '../types/api';

export const getUsers = () => apiRequest<User[]>('/users/');

export const getUserById = (userId: number) => apiRequest<User>(`/users/${userId}`);

export const createUser = (payload: CreateUserPayload) =>
  apiRequest<User>('/users/', { method: 'POST', body: payload });

export const updateUser = (userId: number, payload: UpdateUserPayload) =>
  apiRequest<User>(`/users/${userId}`, { method: 'PUT', body: payload });

export const deleteUser = (userId: number) =>
  apiRequest<ApiDeleteResponse>(`/users/${userId}`, { method: 'DELETE' });
