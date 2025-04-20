"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { LuRefreshCw, LuCircleHelp } from "react-icons/lu";
import { GiTwoCoins } from "react-icons/gi";
import { getChampionBorderClass } from "@/utils/championUtils";
import { championMapping } from "@/utils/championMapping";
import Tooltip from "../components/Tooltip";
import Modal from "../components/Modal";

export interface ChampionFilterProps {
    championFilters: Record<string, boolean>;
    championOverrides: Partial<Record<string, boolean>>;
    setChampionOverridesAction: React.Dispatch<
        React.SetStateAction<Partial<Record<string, boolean>>>
    >;
}

export default function ChampionFilterSection({
                                                  championFilters,
                                                  championOverrides,
                                                  setChampionOverridesAction,
                                              }: ChampionFilterProps) {
    const [helpOpen, setHelpOpen] = useState(false);

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

    const toggleChampion = (champion: string) => {
        const defaultEnabled = championMapping[champion].championTier <= 3;
        const current = championOverrides[champion] ?? defaultEnabled;
        const next = !current;
        setChampionOverridesAction((prev) => {
            const copy = { ...prev, [champion]: next };
            if (next === defaultEnabled) delete copy[champion];
            return copy;
        });
    };

    const toggleTier = (tier: number) => {
        const champs = tierMap[tier] || [];
        const allEnabled = champs.every((c) => championFilters[c]);
        setChampionOverridesAction((prev) => {
            const copy = { ...prev };
            champs.forEach((champ) => {
                const defaultEnabled = championMapping[champ].championTier <= 3;
                const nextValue = !allEnabled;
                if (nextValue === defaultEnabled) delete copy[champ];
                else copy[champ] = nextValue;
            });
            return copy;
        });
    };

    const resetChampionFilters = () => {
        setChampionOverridesAction({});
    };

    const tiers = [1, 2, 3, 4, 5] as const;

    return (
        <section
            aria-labelledby="champion-filters-heading"
            className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4 min-w-0"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                <h2 id="champion-filters-heading" className="text-xl text-white font-bold">
                    Champion Filters
                </h2>

                <div className="flex gap-2" role="toolbar" aria-label="Champion filter actions">
                    <Tooltip text="Reset Champion Filters">
                        <button
                            onClick={resetChampionFilters}
                            aria-label="Reset champion filters"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                        >
                            <LuRefreshCw className="w-5 h-5" />
                        </button>
                    </Tooltip>

                    <Tooltip text="Champion Filter Help">
                        <button
                            onClick={() => setHelpOpen(true)}
                            aria-haspopup="dialog"
                            aria-label="Champion filter help"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                        >
                            <LuCircleHelp className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Help Modal */}
            <Modal
                title="Champion Filter Help"
                isOpen={helpOpen}
                onCloseAction={() => setHelpOpen(false)}
            >
                <p>Click on a champion image to toggle it individually. Use the tier toggles to enable/disable whole tiers.</p>
            </Modal>

            {/* Tiers */}
            {tiers.map((tier, idx) => {
                const champs = tierMap[tier] || [];
                const allEnabled = champs.every((c) => championFilters[c]);
                const isLast = idx === tiers.length - 1;

                return (
                    <fieldset key={tier} className="flex flex-col gap-1">
                        <legend className="flex items-center justify-between mb-1 w-full">
                            <div className="flex items-center gap-1">
                                <GiTwoCoins className="w-5 h-5 text-yellow-400" />
                                <span className="text-lg text-white font-semibold">{tier} cost</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={allEnabled}
                                    onChange={() => toggleTier(tier)}
                                    aria-label={`Enable all ${tier}-cost champions`}
                                />
                                <div className="w-10 h-4 bg-zinc-700 rounded-full peer-checked:bg-emerald-400"></div>
                                <div className="absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition-all peer-checked:translate-x-5"></div>
                            </label>
                        </legend>

                        <ul
                            role="list"
                            className={`flex flex-wrap gap-1 ${!isLast ? "border-b border-zinc-800 pb-2" : ""}`}
                        >
                            {champs.map((champion) => {
                                const fileName = champion.replace(/[\s.'-]/g, "").toLowerCase();
                                const enabled = championFilters[champion];

                                return (
                                    <li key={champion}>
                                        <Tooltip text={champion}>
                                            <button
                                                onClick={() => toggleChampion(champion)}
                                                aria-pressed={enabled}
                                                aria-label={`${champion} filter ${enabled ? "on" : "off"}`}
                                                style={{ filter: enabled ? "none" : "grayscale(1)" }}
                                                className={`w-12 h-12 rounded overflow-hidden border-2 ${getChampionBorderClass(champion)}`}
                                            >
                                                <Image
                                                    src={`/champions/${fileName}.png`}
                                                    alt={champion}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                    draggable={false}
                                                />
                                            </button>
                                        </Tooltip>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>
                );
            })}
        </section>
    );
}
