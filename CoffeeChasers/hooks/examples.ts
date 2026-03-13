import { useMemo } from 'react';
import { apiService } from '../services/api';
import { useAsyncData } from './useAsyncData';

// Example: User Profile Hook
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UseUserProfileResult {
  profile: UserProfile | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export function useUserProfile(): UseUserProfileResult {
  const fetchUserProfile = useMemo(
    () => (signal?: AbortSignal) => apiService.getUserProfile(signal),
    []
  );

  const {
    data: profile,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAsyncData({
    fetchFn: fetchUserProfile,
    autoFetch: true,
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}

// Example: Cafe Details Hook
interface CafeDetails {
  id: string;
  name: string;
  address: string;
  rating: number;
  photos: string[];
}

interface UseCafeDetailsResult {
  cafe: CafeDetails | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export function useCafeDetails(cafeId: string): UseCafeDetailsResult {
  const fetchCafeDetails = useMemo(
    () => (signal?: AbortSignal) => apiService.getCafeDetails(cafeId, signal),
    [cafeId]
  );

  const {
    data: cafe,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAsyncData({
    fetchFn: fetchCafeDetails,
    autoFetch: !!cafeId, // Only fetch if cafeId is provided
  });

  return {
    cafe,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}

// Example: Search Results Hook
interface SearchResults {
  cafes: CafeDetails[];
  total: number;
  hasMore: boolean;
}

interface UseSearchCafesResult {
  results: SearchResults | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

export function useSearchCafes(query: string, enabled: boolean = true): UseSearchCafesResult {
  const fetchSearchResults = useMemo(
    () => (signal?: AbortSignal) => apiService.searchCafes(query, signal),
    [query]
  );

  const {
    data: results,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAsyncData({
    fetchFn: fetchSearchResults,
    autoFetch: enabled && query.length > 0,
  });

  return {
    results,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
