import { useState, useEffect, useCallback, useRef } from 'react';
import { ReviewHistoryEntry } from '../components/ReviewHistorySection';
import { apiService } from '../services/api';

interface UseReviewHistoryResult {
    reviewHistory: ReviewHistoryEntry[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isRefetching: boolean;
}

export function useReviewHistory(): UseReviewHistoryResult {
    const [reviewHistory, setReviewHistory] = useState<ReviewHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track mounted state to prevent state updates after unmount
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchReviewHistory = useCallback(async (isRefetch = false) => {
        try {
            // Cancel any existing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();

            if (isRefetch) {
                setIsRefetching(true);
            } else {
                setIsLoading(true);
            }
            setError(null);

            const data = await apiService.getUserReviewHistory(abortControllerRef.current.signal);

            // Only update state if component is still mounted
            if (isMountedRef.current) {
                setReviewHistory(data);
            }
        } catch (err) {
            // Don't update state if the request was aborted (component unmounted)
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            if (isMountedRef.current) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load review history';
                setError(errorMessage);

                // Log error in development
                if (__DEV__) {
                    console.error('Error fetching review history:', err);
                }
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsRefetching(false);
            }
        }
    }, []);

    const refetch = useCallback(() => {
        return fetchReviewHistory(true);
    }, [fetchReviewHistory]);

    useEffect(() => {
        fetchReviewHistory();

        // Cleanup function
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchReviewHistory]);

    return {
        reviewHistory,
        isLoading,
        error,
        refetch,
        isRefetching,
    };
}