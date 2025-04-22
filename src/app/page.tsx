"use client";

import Script from "next/script";
import { useState, useEffect, useMemo } from "react";
import {
    FaCompress,
    FaExpand,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";
import Header from "../components/Header";
import FilterSection from "../components/FilterSection";
import ChampionFilterSection from "../components/ChampionFilterSection";
import CompSection, { Variant } from "../components/CompSection";
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
    const [compactView, setCompactView] = usePersistedState<boolean>(
        "compactView",
        false
    );
    const [championOverrides, setChampionOverrides] =
        usePersistedState<Partial<Record<string, boolean>>>(
            "championOverrides",
            {}
        );

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
        if (
            typeof window !== "undefined" &&
            window.innerWidth < 1024
        ) {
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

    const filteredSolutions = useMemo(() => {
        const all = comps[lookupKey]?.solutions ?? comps["none"]?.solutions ?? [];
        return all.filter(sol =>
            sol.selected_champions.every(c => championFilters[c])
        );
    }, [comps, lookupKey, championFilters]);

    const displayGroups = useMemo(() => {
        type Group = {
            base: CompData;
            variants?: Variant[];
        };
        const groups: Group[] = [];
        if (!compactView) {
            filteredSolutions.forEach((sol) =>
                groups.push({ base: sol })
            );
            return groups;
        }
        const visited = new Array(filteredSolutions.length).fill(
            false
        );
        for (let i = 0; i < filteredSolutions.length; i++) {
            if (visited[i]) continue;
            const solA = filteredSolutions[i];
            const variants: Variant[] = [];
            const setA = new Set(solA.selected_champions);
            for (let j = i + 1; j < filteredSolutions.length; j++) {
                if (visited[j]) continue;
                const solB = filteredSolutions[j];
                if (
                    solB.selected_champions.length !==
                    solA.selected_champions.length
                )
                    continue;
                const setB = new Set(solB.selected_champions);
                const diffA = solA.selected_champions.filter(
                    (x) => !setB.has(x)
                );
                const diffB = solB.selected_champions.filter(
                    (x) => !setA.has(x)
                );
                if (diffA.length === 1 && diffB.length === 1) {
                    variants.push({
                        baseOnly: diffA[0],
                        variant: diffB[0],
                    });
                    visited[j] = true;
                }
            }
            visited[i] = true;
            groups.push({
                base: solA,
                variants: variants.length > 0 ? variants : undefined,
            });
        }
        return groups;
    }, [filteredSolutions, compactView]);

    return (
        <div
            className="min-h-screen flex flex-col bg-fixed bg-cover bg-center overflow-x-hidden overflow-y-auto bg-[url(/bg.png)]">
            <Header/>
            <h1 className="sr-only">
                Trait Tracker – TFT Set 14 Augment Optimizer Tool
            </h1>
            <main className="flex-grow w-full max-w-screen-2xl mx-auto px-3 py-4">
                {/* Emblem Filters */}
                <aside
                    aria-label="Emblem Filters"
                    className="mb-4 min-w-0"
                >
                    <FilterSection
                        filters={filters}
                        setFiltersAction={setFilters}
                        // remove hideTraits from here
                    />
                </aside>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Mobile Champion Filters Toggle */}
                    <div className="block lg:hidden">
                        <button
                            onClick={() =>
                                setShowChampionFiltersMobile(
                                    (prev) => !prev
                                )
                            }
                            className="bg-zinc-900/75 border border-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-800/75 transition w-full"
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
                                    setChampionOverridesAction={
                                        setChampionOverrides
                                    }
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

                        {/* View Mode & Traits Bar */}
                        <div
                            className="
                bg-zinc-900/75 border border-zinc-800
                shadow-lg rounded p-4 min-w-0 mb-4
                flex items-center justify-between
              "
                        >
              <span className="text-sm text-zinc-200 font-semibold">
                Display Mode
              </span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() =>
                                        setCompactView((prev) => !prev)
                                    }
                                    aria-label={
                                        compactView
                                            ? "Switch to detailed view"
                                            : "Switch to compact view"
                                    }
                                    className="
                    flex items-center gap-2
                    hover:bg-zinc-800 text-white
                    px-3 py-1 rounded-lg transition
                  "
                                >
                                    {compactView ? (
                                        <FaExpand className="size-4 text-white"/>
                                    ) : (
                                        <FaCompress className="size-4 text-white"/>
                                    )}
                                    <span className="text-sm">
                    {compactView
                        ? "Detailed"
                        : "Compact"}
                  </span>
                                </button>
                                <button
                                    onClick={() =>
                                        setHideTraits((prev) => !prev)
                                    }
                                    aria-label={
                                        hideTraits
                                            ? "Show traits"
                                            : "Hide traits"
                                    }
                                    className="
                    flex items-center gap-2
                    hover:bg-zinc-800 text-white
                    px-3 py-1 rounded-lg transition
                  "
                                >
                                    {hideTraits ? (
                                        <FaEyeSlash className="size-4 text-white"/>
                                    ) : (
                                        <FaEye className="size-4 text-white"/>
                                    )}
                                    <span className="text-sm">
                    {hideTraits
                        ? "Show Traits"
                        : "Hide Traits"}
                  </span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div
                                    className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-zinc-500"/>
                            </div>
                        ) : (
                            <ul
                                className="flex flex-col gap-4"
                                role="list"
                            >
                                {displayGroups.length > 0 ? (
                                    displayGroups.map((group, idx) => (
                                        <li key={idx}>
                                            <CompSection
                                                compData={group.base}
                                                hideTraits={hideTraits}
                                                filters={filters}
                                                compact={compactView}
                                                variants={group.variants}
                                            />
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <div
                                            className="text-center py-12 bg-zinc-900/75 rounded-lg border border-zinc-800">
                                            <p className="text-zinc-400">
                                                No compositions found. Try adjusting
                                                your filters.
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
                            setChampionOverridesAction={
                                setChampionOverrides
                            }
                        />
                    </aside>
                </div>
            </main>

            <Footer/>
            <Script
                id="trait-tracker-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        name: "Trait Tracker",
                        url: "https://traittracker.gg",
                        applicationCategory: "Gaming",
                        browserRequirements:
                            "Requires modern web browser",
                        description:
                            "Trait Tracker helps players easily activate the Trait Tracker augment in TFT Set 14 by finding champion combinations that meet the 8-trait requirement.",
                        operatingSystem: "All",
                        keywords:
                            "TFT Set 14, Trait Tracker augment, TFT comps, TFT champion combinations",
                        image: "https://traittracker.gg/og-image.png",
                    }),
                }}
            />
        </div>
    );
}
