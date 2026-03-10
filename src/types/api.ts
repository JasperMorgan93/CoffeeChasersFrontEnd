export type ApiDeleteResponse = {
  detail: string;
};

export type Cafe = {
  id: number;
  name: string;
  lat: number;
  long: number;
};

export type CreateCafePayload = {
  name: string;
  lat: number;
  long: number;
};

export type UpdateCafePayload = Partial<CreateCafePayload>;

export type User = {
  id: number;
  email: string;
  username: string;
};

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;

export type Review = {
  id: number;
  user_id: number;
  cafe_id: number;
  rating: number;
  coffee_type?: string | null;
  created_at?: string;
};

export type CreateReviewPayload = {
  user_id: number;
  cafe_id: number;
  rating: number;
  coffee_type?: string;
};

export type UpdateReviewPayload = Partial<Pick<CreateReviewPayload, 'rating' | 'coffee_type'>>;
