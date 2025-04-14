"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { LuRefreshCw, LuCircleHelp } from "react-icons/lu";
import { getChampionBorderClass } from "@/utils/champion";
import tftTraits from "../../data/tft_traits.json";
import { GiTwoCoins } from "react-icons/gi";
export interface ChampionFilterProps {
    championFilters: Record<string, boolean>;
    setChampionFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function ChampionFilterSection({ championFilters, setChampionFilters }: ChampionFilterProps) {
    const units = tftTraits.units as Record<string, { traits: string[]; champion_tier: number }>;

    // Group champions by tier.
    const tierMap: Record<number, string[]> = {};
    Object.entries(units).forEach(([name, data]) => {
        const tier = data.champion_tier;
        if (!tierMap[tier]) tierMap[tier] = [];
        tierMap[tier].push(name);
    });
    for (const tier in tierMap) {
        tierMap[tier].sort((a, b) => a.localeCompare(b));
    }

    // On mount, if no championFilters exist, default tiers 1–3 enabled; 4–5 disabled.
    useEffect(() => {
        if (Object.keys(championFilters).length === 0) {
            const newFilters: Record<string, boolean> = {};
            Object.entries(tierMap).forEach(([tier, champs]) => {
                const numericTier = Number(tier);
                champs.forEach(champ => {
                    newFilters[champ] = numericTier <= 3;
                });
            });
            setChampionFilters(newFilters);
        }
    }, []);

    const toggleChampion = (champion: string) => {
        setChampionFilters(prev => ({
            ...prev,
            [champion]: !prev[champion],
        }));
    };

    // Toggle all champions in a given tier.
    const toggleTier = (tier: number) => {
        const champs = tierMap[tier] || [];
        const allEnabled = champs.every(champ => championFilters[champ] !== false);
        const newFilters = { ...championFilters };
        champs.forEach(champ => {
            newFilters[champ] = !allEnabled;
        });
        setChampionFilters(newFilters);
    };

    // Reset champion filters to default (tiers 1–3 enabled; tiers 4–5 disabled).
    const resetChampionFilters = () => {
        const newFilters: Record<string, boolean> = {};
        Object.entries(tierMap).forEach(([tier, champs]) => {
            const numericTier = Number(tier);
            champs.forEach(champ => {
                newFilters[champ] = numericTier <= 3;
            });
        });
        setChampionFilters(newFilters);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4">
            {/* Champion Filter Header with inline Reset and Help */}
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
                                alert("Click on a champion image to toggle it individually. Use the toggle switch in the tier header to enable or disable all champions within that tier.")
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
            <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((tier: number) => {
                    const champs = tierMap[tier] || [];
                    const allEnabled = champs.every(champ => championFilters[champ] !== false);
                    return (
                        <div key={tier} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1">
                                    <GiTwoCoins className="size-5 text-yellow-400" />
                                    <span className="text-lg text-white font-semibold">{tier} cost</span>
                                </div>
                                {/* Toggle switch for the tier */}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={allEnabled}
                                        onChange={() => toggleTier(tier)}
                                    />
                                    <div className="w-10 h-4 bg-zinc-700 rounded-full peer focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-green-500"></div>
                                    <div className="absolute left-1 top-0.5 bg-white size-3 rounded-full transition-all peer-checked:translate-x-5"></div>
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-1 border-b border-zinc-800 pb-2">
                                {champs.map((champion: string) => {
                                    const championFile = champion.replace(/[\s.'-]/g, "").toLowerCase();
                                    const enabled = championFilters[champion];
                                    return (
                                        <div key={champion} className="relative group ">
                                            <button
                                                onClick={() => toggleChampion(champion)}
                                                style={{ filter: enabled ? "none" : "grayscale(1)" }}
                                                className={`relative size-12 rounded overflow-hidden border-2 ${getChampionBorderClass(champion)}`}
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
                                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs font-bold rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {champion}
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 size-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
                      </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
