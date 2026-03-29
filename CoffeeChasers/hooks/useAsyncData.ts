import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  initialData?: T;
  autoFetch?: boolean;
}

interface UseAsyncDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Generic hook for handling async data fetching with loading states, error handling,
 * request cancellation, and cleanup. Use this as a base for all API data hooks.
 */
export function useAsyncData<T>(options: UseAsyncDataOptions<T>): UseAsyncDataResult<T> {
  const { fetchFn, initialData, autoFetch = true } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeFetch = useCallback(
    async (isRefetch = false) => {
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

        const result = await fetchFn(abortControllerRef.current.signal);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setData(result);
        }
      } catch (err) {
        // Don't update state if the request was aborted (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        if (isMountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(errorMessage);

          // Log error in development
          if (__DEV__) {
            console.error('useAsyncData error:', err);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [fetchFn]
  );

  const refetch = useCallback(() => {
    return executeFetch(true);
  }, [executeFetch]);

  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      executeFetch();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch, autoFetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
