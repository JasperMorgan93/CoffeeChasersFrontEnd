export interface User {
  id: number; // integer profile ID — used with /reviews/customer/{user_id}
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Raw Supabase session shape returned by POST /users/auth/login and POST /users/auth/signup
export interface SupabaseSessionResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

// Shape returned by GET /users/profiles/me and PUT /users/profiles/me
export interface UserProfile {
  id: number;
  name: string | null;
  email?: string | null;
}

export interface ProfileUpdateRequest {
  name: string | null;
}
