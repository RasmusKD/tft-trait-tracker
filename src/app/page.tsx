"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import FilterSection from "../components/FilterSection";
import ChampionFilterSection from "../components/ChampionFilterSection";
import CompSection from "../components/CompSection";
import Footer from "../components/Footer";
import usePersistedState from "../hooks/usePersistedState";
import { championMapping } from "@/utils/championMapping";

interface CompData {
    selected_champions: string[];
}
interface PrecomputedComps {
    [key: string]: { solutions: CompData[] };
}

function bonusDictToKey(filters: Record<string, number>): string {
    const items = Object.entries(filters)
        .filter(([, v]) => v > 0)
        .sort(([a], [b]) => a.localeCompare(b));
    return items.length === 0
        ? "none"
        : items.map(([k, v]) => `${k}:${v}`).join(",");
}

export default function Home() {
    const [filters, setFilters] = useState<Record<string, number>>({});
    const [hideTraits, setHideTraits] = usePersistedState<boolean>(
        "hideTraits",
        false
    );
    const [championOverrides, setChampionOverrides] = usePersistedState<
        Partial<Record<string, boolean>>
    >("championOverrides", {});

    const championFilters = useMemo(() => {
        const map: Record<string, boolean> = {};
        for (const [name, data] of Object.entries(championMapping)) {
            const defaultEnabled = data.championTier <= 3;
            map[name] = championOverrides[name] ?? defaultEnabled;
        }
        return map;
    }, [championOverrides]);

    const [comps, setComps] = useState<PrecomputedComps>({});
    const [loading, setLoading] = useState(false);
    const [showChampionFiltersMobile, setShowChampionFiltersMobile] =
        useState(false);

    const lookupKey = useMemo(() => bonusDictToKey(filters), [filters]);

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setHideTraits(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        setLoading(true);
        fetch(`/api/comps?filterKey=${encodeURIComponent(lookupKey)}`)
            .then((res) =>
                res.ok
                    ? (res.json() as Promise<PrecomputedComps>)
                    : Promise.reject(`HTTP ${res.status}`)
            )
            .then(setComps)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [lookupKey]);

    const allSolutions: CompData[] =
        comps[lookupKey]?.solutions ?? comps["none"]?.solutions ?? [];

    const filteredSolutions = allSolutions.filter((sol) =>
        sol.selected_champions.every((c) => championFilters[c])
    );

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-center overflow-x-hidden">
            <Header/>
            <main className="flex-grow w-full max-w-screen-2xl mx-auto px-3 py-4">
                {/* Emblem Filters */}
                <aside aria-label="Emblem Filters" className="mb-4 min-w-0">
                    <FilterSection
                        filters={filters}
                        setFiltersAction={setFilters}
                        hideTraits={hideTraits}
                        setHideTraitsAction={setHideTraits}
                    />
                </aside>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Mobile Champion Filters Toggle */}
                    <div className="block lg:hidden">
                        <button
                            onClick={() =>
                                setShowChampionFiltersMobile((prev) => !prev)
                            }
                            className="bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700 transition w-full"
                        >
                            {showChampionFiltersMobile
                                ? "Hide Champion Filters"
                                : "Show Champion Filters"}
                        </button>

                        {showChampionFiltersMobile && (
                            <aside
                                aria-label="Champion Filters"
                                className="mt-4 min-w-0"
                            >
                                <ChampionFilterSection
                                    championFilters={championFilters}
                                    championOverrides={championOverrides}
                                    setChampionOverridesAction={setChampionOverrides}
                                />
                            </aside>
                        )}
                    </div>

                    {/* Composition Results */}
                    <section
                        aria-labelledby="comps-heading"
                        className="flex-1 min-w-0"
                    >
                        <h2 id="comps-heading" className="sr-only">
                            Team Compositions
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div
                                    className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-zinc-500"/>
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-4" role="list">
                                {filteredSolutions.length > 0 ? (
                                    filteredSolutions.map((solution, idx) => (
                                        <li key={idx}>
                                            <CompSection
                                                compData={solution}
                                                hideTraits={hideTraits}
                                                filters={filters}
                                            />
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <div
                                            className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
                                            <p className="text-zinc-400">
                                                No compositions found. Try adjusting your filters.
                                            </p>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        )}
                    </section>

                    {/* Desktop Champion Filters */}
                    <aside
                        aria-label="Champion Filters"
                        className="hidden lg:block lg:w-md min-w-0"
                    >
                        <ChampionFilterSection
                            championFilters={championFilters}
                            championOverrides={championOverrides}
                            setChampionOverridesAction={setChampionOverrides}
                        />
                    </aside>
                </div>
            </main>

            <Footer/>
        </div>
    );
}
