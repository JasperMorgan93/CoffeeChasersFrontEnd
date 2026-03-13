import { useMemo } from 'react';
import { ReviewHistoryEntry } from '../components/ReviewHistorySection';
import { apiService } from '../services/api';
import { useAsyncData } from './useAsyncData';

interface UseReviewHistoryResult {
  reviewHistory: ReviewHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Hook for managing user review history data.
 * Uses the generic useAsyncData hook and only contains business logic specific to reviews.
 */
export function useReviewHistory(): UseReviewHistoryResult {
  // Define the fetch function specific to review history
  const fetchReviewHistory = useMemo(
    () => (signal?: AbortSignal) => apiService.getUserReviewHistory(signal),
    []
  );

  const {
    data: reviewHistory = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAsyncData({
    fetchFn: fetchReviewHistory,
    initialData: [],
    autoFetch: true,
  });

  return {
    reviewHistory,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
