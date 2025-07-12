import { useState, useEffect, useRef } from 'react';
import { CompData } from '@/components/CompSection';

interface UseCompsFetcherProps {
    currentSetIdentifier: string;
    lookupKeyForFilters: string;
    isPageReady: boolean;
}

interface CacheEntry {
    data: CompData[];
    timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCompsFetcher({
    currentSetIdentifier,
    lookupKeyForFilters,
    isPageReady
}: UseCompsFetcherProps) 
{
    const [ comps, setComps ] = useState<CompData[]>([]);
    const [ loading, setLoading ] = useState(false);
    const cacheRef = useRef<Record<string, CacheEntry>>({});

    useEffect(() => 
    {
        if (!isPageReady) 
        {
            setComps([]);
            return;
        }

        const cacheKey = `${ currentSetIdentifier }|${ lookupKeyForFilters }`;
        const cached = cacheRef.current[cacheKey];

        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) 
        {
            setComps(cached.data);
            setLoading(false);
            return;
        }

        // Fast path for "none" filter - use static JSON
        if (lookupKeyForFilters === 'none') 
        {
            setLoading(true);
            const setFolder = currentSetIdentifier.toLowerCase();
            fetch(`/data/${ setFolder }_none_bucket.json`)
                .then((res) =>
                    res.ok
                        ? res.json()
                        : Promise.reject(new Error(`Static file not found: ${ res.status }`))
                )
                .then((data) => 
                {
                    const solutions = data.none?.solutions || [];
                    cacheRef.current[cacheKey] = {
                        data: solutions,
                        timestamp: Date.now()
                    };
                    setComps(solutions);
                })
                .catch((err) => 
                {
                    console.warn(`Failed to load static data for ${ currentSetIdentifier }, falling back to API:`, err);
                    return fetchFromAPI();
                })
                .finally(() => setLoading(false));
            return;
        }

        // Regular API call for filtered results
        fetchFromAPI();

        function fetchFromAPI() 
        {
            setLoading(true);
            fetch(
                `/api/comps?filterKey=${ encodeURIComponent(lookupKeyForFilters) }&setIdentifier=${ encodeURIComponent(currentSetIdentifier) }`
            )
                .then((res) =>
                    res.ok
                        ? res.json()
                        : Promise.reject(new Error(`API Error: ${ res.status }`))
                )
                .then((data) => 
                {
                    const solutions = data[lookupKeyForFilters]?.solutions || [];
                    cacheRef.current[cacheKey] = {
                        data: solutions,
                        timestamp: Date.now()
                    };
                    setComps(solutions);
                })
                .catch((err) => 
                {
                    console.error(`Failed to fetch comps for ${ currentSetIdentifier } with filters ${ lookupKeyForFilters }:`, err);
                    setComps([]);
                })
                .finally(() => setLoading(false));
        }
    }, [ lookupKeyForFilters, currentSetIdentifier, isPageReady ]);

    return { comps, loading };
}