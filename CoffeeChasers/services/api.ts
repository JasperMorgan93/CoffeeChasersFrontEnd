import { ReviewHistoryEntry } from '../components/ReviewHistorySection';
import { MapFilters } from '../types/mapFilters';
import { Cafe, CafeDetails } from '../types/cafe';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface ReviewHistoryResponse {
  reviewHistory: ReviewHistoryEntry[];
}

interface CafesResponse {
  cafes: Cafe[];
  total: number;
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

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = this.timeout, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders = {
      'Content-Type': 'application/json',
      // Add auth token when available
      // 'Authorization': `Bearer ${await getAuthToken()}`,
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

  async getUserReviewHistory(signal?: AbortSignal): Promise<ReviewHistoryEntry[]> {
    try {
      const response = await this.makeRequest<ApiResponse<ReviewHistoryResponse>>(
        '/user/review-history',
        { signal }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch review history');
      }

      return response.data.reviewHistory;
    } catch (error) {
      // Re-throw with more specific error message for this endpoint
      if (error instanceof Error) {
        throw new Error(`Failed to load review history: ${error.message}`);
      }
      throw new Error('Failed to load review history: Unknown error occurred');
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

      const response = await this.makeRequest<ApiResponse<CafesResponse>>(endpoint, { signal });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch cafes');
      }

      return response.data.cafes;
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
      const response = await this.makeRequest<ApiResponse<CafeDetailsResponse>>(endpoint, {
        signal,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch cafe details');
      }

      return mapCafeDetails(response.data.cafe);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load cafe details: ${error.message}`);
      }
      throw new Error('Failed to load cafe details: Unknown error occurred');
    }
  }

  // Add other API methods as needed
  // async createReview(review: CreateReviewRequest, signal?: AbortSignal): Promise<ReviewHistoryEntry> { ... }
  // async updateReview(id: string, review: UpdateReviewRequest, signal?: AbortSignal): Promise<ReviewHistoryEntry> { ... }
  // async deleteReview(id: string, signal?: AbortSignal): Promise<void> { ... }
}

export const apiService = new ApiService();
