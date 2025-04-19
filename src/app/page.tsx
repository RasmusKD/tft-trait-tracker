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
    const [showChampionFiltersMobile, setShowChampionFiltersMobile] = useState(false);

    const lookupKey = useMemo(() => bonusDictToKey(filters), [filters]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isMobile = window.innerWidth < 1024;
            if (isMobile) {
                setHideTraits(true);
            }
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
            .then((data) => setComps(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [lookupKey]);

    const allSolutions: CompData[] =
        comps[lookupKey]?.solutions ?? comps["none"]?.solutions ?? [];

    const filteredSolutions = allSolutions.filter((sol) =>
        sol.selected_champions.every((c) => championFilters[c])
    );

    return (
        <div className="min-h-screen flex flex-col bg-zinc-950">
            <Header />
            <main className="flex-grow container mx-auto px-3 py-4">
                <FilterSection
                    filters={filters}
                    setFiltersAction={setFilters}
                    hideTraits={hideTraits}
                    setHideTraitsAction={setHideTraits}
                />

                <div className="flex flex-col lg:flex-row gap-4 mt-4">
                    <div className="block lg:hidden ">
                        <button
                            onClick={() => setShowChampionFiltersMobile((prev) => !prev)}
                            className="bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700 transition w-full"
                        >
                            {showChampionFiltersMobile ? "Hide Champion Filters" : "Show Champion Filters"}
                        </button>
                        {showChampionFiltersMobile && (
                            <div className="mt-4">
                                <ChampionFilterSection
                                    championFilters={championFilters}
                                    championOverrides={championOverrides}
                                    setChampionOverrides={setChampionOverrides}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div
                                    className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-zinc-500"/>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredSolutions.length > 0 ? (
                                    filteredSolutions.map((solution, idx) => (
                                        <CompSection
                                            key={idx}
                                            compData={solution}
                                            hideTraits={hideTraits}
                                            filters={filters}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
                                        <p className="text-zinc-400">
                                            No compositions found. Try adjusting your filters.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-full hidden lg:block lg:w-md">
                        <ChampionFilterSection
                            championFilters={championFilters}
                            championOverrides={championOverrides}
                            setChampionOverrides={setChampionOverrides}
                        />
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}