import { ReviewHistoryEntry } from '../components/ReviewHistorySection';
import { MapFilters } from '../types/mapFilters';
import { Cafe, CafeDetails } from '../types/cafe';
import {
  LoginCredentials,
  ProfileUpdateRequest,
  RegisterCredentials,
  SupabaseSessionResponse,
  UserProfile,
} from '../types/auth';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface ReviewHistoryResponse {
  reviewHistory: ReviewHistoryEntry[];
}

// Shape returned by the API for each cafe in GET /cafes
interface CafeApi {
  id: number | string;
  name: string;
  lat: number;
  long: number;
  google_place_id?: string | null;
  address?: string | null;
  rating?: number | null;
  is_favourite?: boolean | null;
  is_open?: boolean | null;
  opening_hours?: unknown;
}

interface CafeDetailsResponse {
  cafe: CafeDetailsApi;
}

interface CafeDetailsApi {
  id: string;
  name?: string;
  google_rating?: number | null;
  googleRating?: number | null;
  address?: string | null;
  formatted_address?: string | null;
  website?: string | null;
  url?: string | null;
  opening_hours?: string[] | { weekday_text?: string[] | null } | null;
  openingHours?: string[] | null;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const parseOpeningHours = (source: CafeDetailsApi): string[] => {
  if (Array.isArray(source.openingHours)) {
    return source.openingHours.filter(Boolean);
  }

  if (Array.isArray(source.opening_hours)) {
    return source.opening_hours.filter(Boolean);
  }

  const weekdayText = source.opening_hours?.weekday_text;
  if (Array.isArray(weekdayText)) {
    return weekdayText.filter(Boolean);
  }

  return [];
};

const mapCafe = (source: CafeApi): Cafe => ({
  id: String(source.id),
  name: source.name,
  address: source.address ?? '',
  latitude: source.lat,
  longitude: source.long,
  rating: source.rating ?? 0,
  isFavourite: source.is_favourite ?? false,
  isOpen: source.is_open ?? false,
});

interface ReviewApi {
  id: number;
  user_id: number;
  cafe_id: number;
  rating: number;
  coffee_type?: string | null;
  created_at?: string | null;
  cafe?: { name?: string | null } | null;
}

interface CreateReviewRequest {
  cafe_id: number | string;
  rating: number;
  coffee_type?: string;
}

const mapReview = (source: ReviewApi): ReviewHistoryEntry => ({
  id: String(source.id),
  cafeName: source.cafe?.name ?? `Cafe #${source.cafe_id}`,
  rating: source.rating,
  coffeeType: source.coffee_type ?? undefined,
  reviewDate: source.created_at ? new Date(source.created_at).toLocaleDateString() : 'Unknown date',
});

const mapCafeDetails = (source: CafeDetailsApi): CafeDetails => {
  const googleRating = source.googleRating ?? source.google_rating ?? null;
  const address = source.address ?? source.formatted_address ?? null;
  const website = source.website ?? source.url ?? null;

  return {
    id: source.id,
    name: source.name ?? 'Cafe Details',
    googleRating,
    address,
    website,
    openingHours: parseOpeningHours(source),
  };
};

class ApiService {
  private readonly baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.coffeechasers.com';
  private readonly timeout = 10000; // 10 seconds
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = this.timeout, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const apiError = new Error(
          `API Error: ${response.status} - ${response.statusText}`
        ) as ApiError;
        apiError.status = response.status;
        apiError.code = response.status.toString();

        // Log detailed error for debugging
        if (__DEV__) {
          console.error('API Request failed:', {
            url,
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
        }

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error(
          'Network error: Please check your internet connection'
        ) as ApiError;
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please try again.') as ApiError;
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<SupabaseSessionResponse> {
    try {
      return await this.makeRequest<SupabaseSessionResponse>('/users/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Login failed: Please check your email and password and try again. (${error.message})`
        );
      }
      throw new Error('Login failed: Unknown error occurred');
    }
  }
  async register(credentials: RegisterCredentials): Promise<SupabaseSessionResponse> {
    try {
      return await this.makeRequest<SupabaseSessionResponse>('/users/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Unknown error occurred');
    }
  }
  async getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
    try {
      return await this.makeRequest<UserProfile>('/users/profiles/me', { signal });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load profile: ${error.message}`);
      }
      throw new Error('Failed to load profile: Unknown error occurred');
    }
  }

  async updateMyProfile(data: ProfileUpdateRequest, signal?: AbortSignal): Promise<UserProfile> {
    try {
      return await this.makeRequest<UserProfile>('/users/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(data),
        signal,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
      throw new Error('Failed to update profile: Unknown error occurred');
    }
  }

  async getUserReviewHistory(userId: number, signal?: AbortSignal): Promise<ReviewHistoryEntry[]> {
    try {
      const raw = await this.makeRequest<ReviewApi[]>(`/reviews/customer/${userId}`, { signal });
      return raw.map(mapReview);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load review history: ${error.message}`);
      }
      throw new Error('Failed to load review history: Unknown error occurred');
    }
  }

  async createReview(data: CreateReviewRequest, signal?: AbortSignal): Promise<ReviewHistoryEntry> {
    try {
      const raw = await this.makeRequest<ReviewApi>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
        signal,
      });

      return mapReview(raw);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit review: ${error.message}`);
      }
      throw new Error('Failed to submit review: Unknown error occurred');
    }
  }

  async getFilteredCafes(filters: MapFilters, signal?: AbortSignal): Promise<Cafe[]> {
    try {
      // Build query parameters based on active filters
      const queryParams = new URLSearchParams();

      if (filters.favourites) {
        queryParams.append('favourites', 'true');
      }

      if (filters.openNow) {
        queryParams.append('openNow', 'true');
      }

      const endpoint = `/cafes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      // API returns a raw array of cafes (not wrapped in { success, data })
      const raw = await this.makeRequest<CafeApi[]>(endpoint, { signal });

      return raw.map(mapCafe);
    } catch (error) {
      // Re-throw with more specific error message for this endpoint
      if (error instanceof Error) {
        throw new Error(`Failed to load cafes: ${error.message}`);
      }
      throw new Error('Failed to load cafes: Unknown error occurred');
    }
  }

  async getCafeDetails(cafeId: string, signal?: AbortSignal): Promise<CafeDetails> {
    try {
      const normalizedCafeId = cafeId.trim();
      if (!normalizedCafeId) {
        throw new Error('Cafe ID is required');
      }

      const endpoint = `/cafes/${encodeURIComponent(normalizedCafeId)}`;
      // API returns a single CafeDetailsApi object directly
      const raw = await this.makeRequest<CafeDetailsApi>(endpoint, { signal });

      return mapCafeDetails(raw);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load cafe details: ${error.message}`);
      }
      throw new Error('Failed to load cafe details: Unknown error occurred');
    }
  }

  // Add other API methods as needed
  // async updateReview(id: string, review: UpdateReviewRequest, signal?: AbortSignal): Promise<ReviewHistoryEntry> { ... }
  // async deleteReview(id: string, signal?: AbortSignal): Promise<void> { ... }
}

export const apiService = new ApiService();
