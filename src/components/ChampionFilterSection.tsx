"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { LuRefreshCw, LuCircleHelp } from "react-icons/lu";
import { GiTwoCoins } from "react-icons/gi";
import { getChampionBorderClass } from "@/utils/championUtils";
import { championMapping } from "@/utils/championMapping";

export interface ChampionFilterProps {
    championFilters: Record<string, boolean>;
    championOverrides: Partial<Record<string, boolean>>;
    setChampionOverrides: React.Dispatch<
        React.SetStateAction<Partial<Record<string, boolean>>>
    >;
}

export default function ChampionFilterSection({
                                                  championFilters,
                                                  championOverrides,
                                                  setChampionOverrides,
                                              }: ChampionFilterProps) {
    // Group champions by tier.
    const tierMap = useMemo(() => {
        const map: Record<number, string[]> = {};
        Object.entries(championMapping).forEach(([name, data]) => {
            const tier = data.championTier;
            if (!map[tier]) map[tier] = [];
            map[tier].push(name);
        });
        Object.values(map).forEach((arr) => arr.sort((a, b) => a.localeCompare(b)));
        return map;
    }, []);

    // Toggle a single champion, storing only overrides
    const toggleChampion = (champion: string) => {
        const defaultEnabled = championMapping[champion].championTier <= 3;
        const current = championOverrides[champion] ?? defaultEnabled;
        const next = !current;
        setChampionOverrides((prev) => {
            const copy = { ...prev, [champion]: next };
            if (next === defaultEnabled) delete copy[champion];
            return copy;
        });
    };

    // Toggle an entire tier
    const toggleTier = (tier: number) => {
        const champs = tierMap[tier] || [];
        const allEnabled = champs.every((c) => championFilters[c]);
        setChampionOverrides((prev) => {
            const copy = { ...prev };
            champs.forEach((champ) => {
                const defaultEnabled = championMapping[champ].championTier <= 3;
                const nextValue = !allEnabled;
                if (nextValue === defaultEnabled) {
                    delete copy[champ];
                } else {
                    copy[champ] = nextValue;
                }
            });
            return copy;
        });
    };

    // Reset back to no overrides
    const resetChampionFilters = () => {
        setChampionOverrides({});
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4">
            <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                <h2 className="text-xl text-white font-bold">Champion Filters</h2>
                <div className="flex gap-2">
                    <div className="relative group">
                        <button
                            onClick={resetChampionFilters}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuRefreshCw className="size-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            Reset Champion Filters
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
            </span>
                    </div>
                    <div className="relative group">
                        <button
                            onClick={() =>
                                alert(
                                    "Click on a champion image to toggle it individually. Use the toggle switch in the tier header to enable or disable all champions within that tier."
                                )
                            }
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuCircleHelp className="size-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Champion Filter Help
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
            </span>
                    </div>
                </div>
            </div>

            {([1, 2, 3, 4, 5] as const).map((tier) => {
                const champs = tierMap[tier] || [];
                const allEnabled = champs.every((c) => championFilters[c]);
                return (
                    <div key={tier} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                                <GiTwoCoins className="size-5 text-yellow-400" />
                                <span className="text-lg text-white font-semibold">
                  {tier} cost
                </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={allEnabled}
                                    onChange={() => toggleTier(tier)}
                                />
                                <div className="w-10 h-4 bg-zinc-700 rounded-full peer-checked:bg-emerald-400"></div>
                                <div className="absolute left-1 top-0.5 bg-white size-3 rounded-full transition-all peer-checked:translate-x-5"></div>
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-1 border-b border-zinc-800 pb-2">
                            {champs.map((champion) => {
                                const championFile = champion
                                    .replace(/[\s.'-]/g, "")
                                    .toLowerCase();
                                const enabled = championFilters[champion];
                                return (
                                    <div key={champion} className="relative group">
                                        <button
                                            onClick={() => toggleChampion(champion)}
                                            style={{ filter: enabled ? "none" : "grayscale(1)" }}
                                            className={`relative size-12 rounded overflow-hidden border-2 ${getChampionBorderClass(
                                                champion
                                            )}`}
                                        >
                                            <Image
                                                src={`/champions/${championFile}.png`}
                                                alt={champion}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                                draggable={false}
                                            />
                                        </button>
                                        {/* Tooltip */}
                                        <span
                                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs font-bold rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {champion}
                                            <div
                                                className="absolute top-full left-1/2 transform -translate-x-1/2 size-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
                      </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
