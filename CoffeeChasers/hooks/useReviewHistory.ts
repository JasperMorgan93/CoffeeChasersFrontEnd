import { useState, useEffect } from 'react';
import { ReviewHistoryEntry } from '../components/ReviewHistorySection';
import { apiService } from '../services/api';

interface UseReviewHistoryResult {
    reviewHistory: ReviewHistoryEntry[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useReviewHistory(): UseReviewHistoryResult {
    const [reviewHistory, setReviewHistory] = useState<ReviewHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviewHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await apiService.getUserReviewHistory();
            setReviewHistory(data);
        } catch (err) {
            console.error('Error fetching review history:', err);
            setError(err instanceof Error ? err.message : 'Failed to load review history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewHistory();
    }, []);

    return {
        reviewHistory,
        isLoading,
        error,
        refetch: fetchReviewHistory,
    };
}