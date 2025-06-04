'use client';

import Script from 'next/script';
import { useState, useEffect, useMemo, useRef } from 'react';
import { FaCompress, FaExpand, FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../components/Header';
import FilterSection from '../components/FilterSection';
import ChampionFilterSection from '../components/ChampionFilterSection';
import CompSection, { CompData, Variant } from '../components/CompSection';
import Footer from '../components/Footer';
import usePersistedState from '../hooks/usePersistedState';
import {
    getChampionMappingForSet,
    ChampionData as ChampionMappingData,
} from '@/utils/championMapping';
import { APP_CONFIG } from '@/config/app';

interface Group {
    base: CompData;
    variants?: Variant[];
}

const AVAILABLE_SETS = [ 'TFTSet14', 'TFTSet10' ];

const getDefaultChampionEnabled = (
    championData: ChampionMappingData | undefined
): boolean => 
{
    return championData ? championData.championTier <= 3 : false;
};

function bonusDictToKey(filters: Record<string, number>): string 
{
    const items = Object.entries(filters)
        .filter(([ , v ]) => v > 0)
        .sort(([ a ], [ b ]) => a.localeCompare(b));
    return items.length === 0
        ? 'none'
        : items.map(([ k, v ]) => `${ k }:${ v }`).join(',');
}

const PageLoader = ({ message = 'Loading Set...' }: { message?: string }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fixed bg-cover bg-center bg-[url(/bg.png)]">
        <div className="animate-spin rounded-full size-16 border-t-4 border-b-4 border-blue-500" />
        <p className="text-white text-xl mt-4">{ message }</p>
    </div>
);

const ApiLoadingSpinner = () => (
    <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-zinc-500" />
    </div>
);


export default function Home() 
{
    const [ isPageReady, setIsPageReady ] = useState(false); // Combined readiness flag

    const [ currentSetIdentifier, setCurrentSetIdentifier ] = usePersistedState<string>(
        'app_currentSetIdentifier',
        AVAILABLE_SETS[0]
    );

    // Track if the currentSetIdentifier itself has been hydrated
    const [ isSetIdentifierHydrated, setIsSetIdentifierHydrated ] = useState(false);

    useEffect(() =>
    {
        let effectiveSet = currentSetIdentifier;
        if (!AVAILABLE_SETS.includes(currentSetIdentifier))
        {
            effectiveSet = AVAILABLE_SETS[0];
            setCurrentSetIdentifier(effectiveSet);
        }
        setIsSetIdentifierHydrated(true);
    }, [ currentSetIdentifier, setCurrentSetIdentifier ]);


    // We need to know when these have finished their initial load for the *current* set
    const [ filters, setFilters ] = useState<Record<string, number>>({});
    
    const [ hideTraits, setHideTraits, hideTraitsInitialized ] = usePersistedState<boolean>(
        'app_hideTraits', false, currentSetIdentifier, true
    );
    const [ compactView, setCompactView, compactViewInitialized ] = usePersistedState<boolean>(
        'app_compactView', false, currentSetIdentifier, true
    );
    const [ championOverrides, setChampionOverrides, championOverridesInitialized ] = usePersistedState<
        Partial<Record<string, boolean>>
    >('app_championOverrides', {}, currentSetIdentifier, true);


    // Update isPageReady when all critical persisted states are initialized for the current set
    useEffect(() => 
    {
        if (isSetIdentifierHydrated && hideTraitsInitialized && compactViewInitialized && championOverridesInitialized) 
        {
            setIsPageReady(true);
        }
        else 
        {
            setIsPageReady(false);
        }
    }, [ isSetIdentifierHydrated, hideTraitsInitialized, compactViewInitialized, championOverridesInitialized ]);

    const championMappingForCurrentSet = useMemo(
        () => isPageReady ? getChampionMappingForSet(currentSetIdentifier) : {},
        [ currentSetIdentifier, isPageReady ]
    );

    const championFilters = useMemo(() => 
    {
        if (!isPageReady) return {};
        const map: Record<string, boolean> = {};
        for (const [ name, data ] of Object.entries(championMappingForCurrentSet)) 
        {
            const override = championOverrides[name];
            map[name] =
                override === undefined
                    ? getDefaultChampionEnabled(data)
                    : override;
        }
        return map;
    }, [ championMappingForCurrentSet, championOverrides, isPageReady ]);


    const [ compsForFilterKey, setCompsForFilterKey ] = useState<CompData[]>([]);
    const cacheRef = useRef<Record<string, CompData[]>>({});
    const [ apiLoading, setApiLoading ] = useState(false);
    const [ isSmallScreen, setIsSmallScreen ] = useState(false);
    const [ showChampionFiltersMobile, setShowChampionFiltersMobile ] = useState(false);

    const lookupKeyForFilters = useMemo(() => bonusDictToKey(filters), [ filters ]);

    useEffect(() => 
    {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 1024);
        if (typeof window !== 'undefined') 
        {
            checkScreenSize();
            window.addEventListener('resize', checkScreenSize);
            return () => window.removeEventListener('resize', checkScreenSize);
        }
    }, []);

    useEffect(() => 
    {
        if (!isPageReady) 
        {
            setCompsForFilterKey([]);
            return;
        }

        const cacheKey = `${ currentSetIdentifier }|${ lookupKeyForFilters }`;
        if (cacheRef.current[cacheKey]) 
        {
            setCompsForFilterKey(cacheRef.current[cacheKey]);
            setApiLoading(false);
            return;
        }

        // Fast path for "none" filter - use static JSON
        if (lookupKeyForFilters === 'none') 
        {
            setApiLoading(true);
            const setFolder = currentSetIdentifier.toLowerCase();
            fetch(`/data/${ setFolder }_none_bucket.json`)
                .then((res) => res.ok ? res.json() : Promise.reject(new Error(`Static file not found: ${ res.status }`)))
                .then((data) => 
                {
                    const solutions = data.none?.solutions || [];
                    cacheRef.current[cacheKey] = solutions;
                    setCompsForFilterKey(solutions);
                })
                .catch((err) => 
                {
                    console.warn(`Failed to load static data for ${ currentSetIdentifier }, falling back to API:`, err);
                    // Fallback to API call
                    return fetchFromAPI();
                })
                .finally(() => setApiLoading(false));
            return;
        }

        // Regular API call for filtered results
        fetchFromAPI();

        function fetchFromAPI() 
        {
            setApiLoading(true);
            fetch(
                `/api/comps?filterKey=${ encodeURIComponent(
                    lookupKeyForFilters
                ) }&setIdentifier=${ encodeURIComponent(currentSetIdentifier) }`
            )
                .then((res) => res.ok ? res.json() : Promise.reject(new Error(`API Error: ${ res.status }`)))
                .then((data) => 
                {
                    const solutions = data[lookupKeyForFilters]?.solutions || [];
                    cacheRef.current[cacheKey] = solutions;
                    setCompsForFilterKey(solutions);
                })
                .catch((err) => 
                {
                    console.error(`Failed to fetch comps for ${ currentSetIdentifier } with filters ${ lookupKeyForFilters }:`, err);
                    setCompsForFilterKey([]);
                })
                .finally(() => setApiLoading(false));
        }
    }, [ lookupKeyForFilters, currentSetIdentifier, isPageReady ]);

    const filteredSolutions = useMemo(() => 
    {
        if (!isPageReady) return [];
        return compsForFilterKey.filter((sol) =>
            sol.selected_champions.every((c) => championFilters[c])
        );
    }, [ compsForFilterKey, championFilters, isPageReady ]);

    const displayGroups = useMemo((): Group[] => 
    {
        if (!isPageReady) return [];
        const groups: Group[] = [];
        if (!compactView || filteredSolutions.length === 0) 
        {
            return filteredSolutions.map(
                (sol): Group => ({ base: sol, variants: undefined })
            );
        }
        const solutionsCopy = JSON.parse(JSON.stringify(filteredSolutions)) as CompData[];
        const visited = new Array(solutionsCopy.length).fill(false);
        for (let i = 0; i < solutionsCopy.length; i++) 
        {
            if (visited[i]) continue;
            const solA = solutionsCopy[i];
            const currentVariants: Variant[] = [];
            const setA = new Set(solA.selected_champions);
            for (let j = i + 1; j < solutionsCopy.length; j++) 
            {
                if (visited[j]) continue;
                const solB = solutionsCopy[j];
                if (solB.selected_champions.length !== solA.selected_champions.length) continue;
                const setB = new Set(solB.selected_champions);
                const diffA = solA.selected_champions.filter((x) => !setB.has(x));
                const diffB = solB.selected_champions.filter((x) => !setA.has(x));
                if (diffA.length === 1 && diffB.length === 1) 
                {
                    currentVariants.push({ baseOnly: diffA[0], variant: diffB[0] });
                    visited[j] = true;
                }
            }
            visited[i] = true;
            groups.push({
                base: solA,
                variants: currentVariants.length > 0 ? currentVariants : undefined,
            });
        }
        return groups;
    }, [ filteredSolutions, compactView, isPageReady ]);

    const handleSetChange = (newSet: string) => 
    {
        if (AVAILABLE_SETS.includes(newSet) && newSet !== currentSetIdentifier) 
        {
            // When set changes, isPageReady will become false because
            // isSetIdentifierHydrated and other *Initialized flags will reset/re-evaluate.
            // This naturally causes the loader to show.
            setFilters({}); // Reset set filters
            setCurrentSetIdentifier(newSet);
            setCompsForFilterKey([]); // Clear old data
            cacheRef.current = {}; // Clear API cache
        }
    };

    if (!isPageReady) 
    { // Show loader until all states for the current set are initialized
        return <PageLoader message={ `Loading Set ${ currentSetIdentifier.replace('TFTSet','') }...` } />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-fixed bg-cover bg-center overflow-x-hidden overflow-y-auto bg-[url(/bg.png)]">
            <Header
                currentSet={ currentSetIdentifier }
                availableSets={ AVAILABLE_SETS }
                onSetChangeAction={ handleSetChange }
                showSelectorInHeader={ !isSmallScreen }
            />
            <h1 className="sr-only">Trait Tracker – TFT Augment Optimizer Tool</h1>
            <main className="flex-grow w-full max-w-screen-2xl mx-auto px-3 py-4">
                { isSmallScreen && (
                    <div className="mb-4 p-3 bg-zinc-900/75 border border-zinc-800 rounded shadow-lg">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center bg-zinc-800/50 border border-zinc-700 rounded-lg p-1 w-full max-w-sm">
                                { AVAILABLE_SETS.map((setId) => 
                                {
                                    const isActive = setId === currentSetIdentifier;
                                    const displayName = setId.replace('TFTSet', 'Set ');

                                    return (
                                        <button
                                            key={ setId }
                                            onClick={ () => handleSetChange(setId) }
                                            className={ `
                                flex-1 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200
                                ${ isActive
                                            ? 'bg-indigo-800 text-white shadow-md'
                                            : 'text-zinc-300 hover:text-white hover:bg-zinc-700/50 cursor-pointer'
                                        }
                            ` }
                                            aria-pressed={ isActive }
                                            aria-label={ `Switch to ${ displayName }` }
                                        >
                                            { displayName }
                                        </button>
                                    );
                                }) }
                            </div>
                        </div>
                    </div>
                ) }
                <aside aria-label="Emblem Filters" className="mb-4 min-w-0">
                    <FilterSection
                        setIdentifier={ currentSetIdentifier }
                        filters={ filters }
                        setFiltersAction={ setFilters }
                    />
                </aside>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="block lg:hidden">
                        <button
                            onClick={ () => setShowChampionFiltersMobile((prev) => !prev) }
                            className="bg-zinc-900/75 border border-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-800/75 transition w-full cursor-pointer"
                        >
                            { showChampionFiltersMobile ? 'Hide Champion Filters' : 'Show Champion Filters' }
                        </button>
                        { showChampionFiltersMobile && (
                            <aside aria-label="Champion Filters" className="mt-4 min-w-0">
                                <ChampionFilterSection
                                    setIdentifier={ currentSetIdentifier }
                                    championFilters={ championFilters } // This depends on championMappingForCurrentSet
                                    championOverrides={ championOverrides }
                                    setChampionOverridesAction={ setChampionOverrides }
                                />
                            </aside>
                        ) }
                    </div>
                    <section aria-labelledby="comps-heading" className="flex-1 min-w-0">
                        <h2 id="comps-heading" className="sr-only">Team Compositions</h2>
                        <div className="bg-zinc-900/75 border border-zinc-800 shadow-lg rounded p-4 min-w-0 mb-4 flex items-center justify-between">
                            { !isSmallScreen &&
                            <span className="text-sm text-zinc-200 font-semibold">Display Mode</span>
                            }
                            <div className={ `flex items-center gap-4 ${ isSmallScreen ? 'w-full justify-evenly' : '' }`}>
                                <button
                                    onClick={ () => setCompactView((prev) => !prev) }
                                    aria-label={ compactView ? 'Switch to detailed view' : 'Switch to compact view' }
                                    className="flex items-center gap-2 hover:bg-zinc-800 text-white px-3 py-1 rounded-lg transition cursor-pointer"
                                >
                                    { compactView ? <FaExpand className="size-4 text-white" /> : <FaCompress className="size-4 text-white" /> }
                                    <span className="text-sm">{ compactView ? 'Detailed' : 'Compact' }</span>
                                </button>
                                <button
                                    onClick={ () => setHideTraits((prev) => !prev) }
                                    aria-label={ hideTraits ? 'Show traits' : 'Hide traits' }
                                    className="flex items-center gap-2 hover:bg-zinc-800 text-white px-3 py-1 rounded-lg transition cursor-pointer"
                                >
                                    { hideTraits ? <FaEyeSlash className="size-4 text-white" /> : <FaEye className="size-4 text-white" /> }
                                    <span className="text-sm">{ hideTraits ? 'Show Traits' : 'Hide Traits' }</span>
                                </button>
                            </div>
                        </div>
                        { apiLoading && compsForFilterKey.length === 0 ? (
                            <ApiLoadingSpinner />
                        ) : (
                            <ul className="flex flex-col gap-4" role="list">
                                { displayGroups.length > 0 ? (
                                    displayGroups.map((group, idx) => (
                                        <li key={ `${ currentSetIdentifier }-${ idx }-${ group.base.selected_champions.join('') }` }>
                                            <CompSection
                                                setIdentifier={ currentSetIdentifier }
                                                compData={ group.base }
                                                hideTraits={ hideTraits }
                                                filters={ filters }
                                                compact={ compactView }
                                                variants={ group.variants }
                                            />
                                        </li>
                                    ))
                                ) : (
                                    !apiLoading && (
                                        <li>
                                            <div className="text-center py-12 bg-zinc-900/75 rounded-lg border border-zinc-800">
                                                <p className="text-zinc-400">
                                                    No compositions found for { currentSetIdentifier.replace('TFTSet', 'Set ') }. Try adjusting your filters.
                                                </p>
                                            </div>
                                        </li>
                                    )
                                ) }
                            </ul>
                        ) }
                    </section>
                    <aside
                        aria-label="Champion Filters"
                        className="hidden lg:block lg:w-md min-w-0"
                    >
                        <ChampionFilterSection
                            setIdentifier={ currentSetIdentifier }
                            championFilters={ championFilters }
                            championOverrides={ championOverrides }
                            setChampionOverridesAction={ setChampionOverrides }
                        />
                    </aside>
                </div>
            </main>
            <Footer />
            <Script
                id="trait-tracker-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={ {
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: APP_CONFIG.name,
                        url: APP_CONFIG.url,
                        applicationCategory: 'Gaming',
                        browserRequirements: 'Requires modern web browser',
                        description: `${ APP_CONFIG.name } helps players easily activate the Trait Tracker augment in Teamfight Tactics by finding champion combinations that meet the 8-trait requirement for various TFT sets.`,
                        operatingSystem: 'All',
                        keywords: 'TFT, Trait Tracker augment, TFT comps, TFT champion combinations, Teamfight Tactics, Remix Rumble',
                        image: `${ APP_CONFIG.url }/og-image.png`,
                    }),
                } }
            />
        </div>
    );
}
