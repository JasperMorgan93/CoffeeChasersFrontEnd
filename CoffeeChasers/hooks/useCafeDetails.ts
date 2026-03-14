import { useMemo } from 'react';
import { apiService } from '../services/api';
import { useAsyncData } from './useAsyncData';
import { CafeDetails } from '../types/cafe';

interface UseCafeDetailsResult {
    cafeDetails: CafeDetails | undefined;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    isRefetching: boolean;
}

export function useCafeDetails(
    cafeId?: string,
    shouldFetch = true
): UseCafeDetailsResult {
    const normalizedCafeId = useMemo(() => cafeId?.trim() ?? '', [cafeId]);
    const shouldAutoFetch = shouldFetch && normalizedCafeId.length > 0;

    const fetchCafeDetails = useMemo(
        () => (signal?: AbortSignal) => apiService.getCafeDetails(normalizedCafeId, signal),
        [normalizedCafeId]
    );

    const {
        data,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useAsyncData<CafeDetails>({
        fetchFn: fetchCafeDetails,
        autoFetch: shouldAutoFetch,
    });

    return {
        cafeDetails: data,
        isLoading,
        error,
        refetch,
        isRefetching,
    };
}
