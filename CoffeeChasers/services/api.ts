import { ReviewHistoryEntry } from '../components/ReviewHistorySection';

interface ApiResponse<T> {
    data: T;
    message?: string;
}

interface ReviewHistoryResponse {
    reviewHistory: ReviewHistoryEntry[];
}

class ApiService {
    private baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://api.coffeechasers.com';

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            // Add auth token when available
            // 'Authorization': `Bearer ${await getAuthToken()}`,
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        return response.json();
    }

    async getUserReviewHistory(): Promise<ReviewHistoryEntry[]> {
        const response = await this.makeRequest<ApiResponse<ReviewHistoryResponse>>('/user/review-history'); // WIP
        return response.data.reviewHistory;
    }

    // Add other API methods as needed
    // async createReview(review: CreateReviewRequest): Promise<ReviewHistoryEntry> { ... }
    // async updateReview(id: string, review: UpdateReviewRequest): Promise<ReviewHistoryEntry> { ... }
    // async deleteReview(id: string): Promise<void> { ... }
}

export const apiService = new ApiService();