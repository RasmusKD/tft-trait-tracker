"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import {
    LuMinus,
    LuPlus,
    LuRefreshCw,
    LuCircleHelp,
    LuEye,
    LuEyeOff,
} from "react-icons/lu";
import Modal from "../components/Modal";
import Tooltip from "../components/Tooltip";

const ELIGIBLE_BONUS_TRAITS = [
    "Anima Squad",
    "BoomBot",
    "Divinicorp",
    "Exotech",
    "Golden Ox",
    "Street Demon",
    "Syndicate",
    "Bastion",
    "Bruiser",
    "Dynamo",
    "Executioner",
    "Marksman",
    "Rapidfire",
    "Slayer",
    "Strategist",
    "Techie",
    "Vanguard",
] as const;

const MAX_BONUS_MAP: Record<typeof ELIGIBLE_BONUS_TRAITS[number], number> = {
    "Anima Squad": 2,
    BoomBot: 2,
    Divinicorp: 1,
    Exotech: 2,
    "Golden Ox": 2,
    "Street Demon": 2,
    Syndicate: 2,
    Bastion: 2,
    Bruiser: 2,
    Dynamo: 2,
    Executioner: 2,
    Marksman: 2,
    Rapidfire: 2,
    Slayer: 2,
    Strategist: 2,
    Techie: 2,
    Vanguard: 2,
};

export interface FilterSectionProps {
    filters: Record<string, number>;
    setFiltersAction: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    hideTraits: boolean;
    setHideTraitsAction: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FilterSection({
                                          filters,
                                          setFiltersAction,
                                          hideTraits,
                                          setHideTraitsAction,
                                      }: FilterSectionProps) {
    const totalBonus = Object.values(filters).reduce((acc, val) => acc + val, 0);
    const [filterHelpOpen, setFilterHelpOpen] = useState(false);

    const updateFilter = useCallback(
        (trait: string, delta: number) => {
            setFiltersAction((prev) => {
                const current = prev[trait] ?? 0;
                const newValue = Math.min(
                    Math.max(current + delta, 0),
                    MAX_BONUS_MAP[trait as typeof ELIGIBLE_BONUS_TRAITS[number]]
                );
                const next = { ...prev };
                if (newValue > 0) next[trait] = newValue;
                else delete next[trait];
                return next;
            });
        },
        [setFiltersAction]
    );

    const resetFilters = () => setFiltersAction({});
    const toggleHideTraits = () => setHideTraitsAction((x) => !x);

    return (
        <section
            aria-labelledby="filter-heading"
            className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4 min-w-0"
        >
            {/* Header + icon buttons */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id="filter-heading" className="text-xl text-white font-bold">
                        Emblem Filters
                    </h2>
                    <p className="hidden md:block text-zinc-400 text-sm">
                        Add your emblems to see comps that use the fewest units and lowest cost.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Tooltip text={hideTraits ? "Show Comp Traits" : "Hide Comp Traits"}>
                        <button
                            onClick={toggleHideTraits}
                            aria-pressed={!hideTraits}
                            aria-label={`${hideTraits ? "Show" : "Hide"} comp traits`}
                            className={`p-2 rounded ${
                                hideTraits
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                            } text-white`}
                        >
                            {hideTraits ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                        </button>
                    </Tooltip>

                    <Tooltip text="Reset Filters">
                        <button
                            onClick={resetFilters}
                            aria-label="Reset Filters"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                        >
                            <LuRefreshCw className="w-5 h-5" />
                        </button>
                    </Tooltip>

                    <Tooltip text="Filter Help">
                        <button
                            onClick={() => setFilterHelpOpen(true)}
                            aria-haspopup="dialog"
                            aria-label="Filter Help"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                        >
                            <LuCircleHelp className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Help Modal */}
            <Modal
                title="Filtering Help"
                isOpen={filterHelpOpen}
                onCloseAction={() => setFilterHelpOpen(false)}
            >
                <p>
                    Use the emblem filters to select which emblems you have. The tool
                    will then show you team compositions that require the fewest units
                    and the lowest cost.
                </p>
                <p className="mt-2">Each configuration shows up to 50 comps.</p>
            </Modal>

            {/* Emblem Grid */}
            <ul
                role="list"
                className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 2xl:grid-cols-17 gap-2"
            >
                {ELIGIBLE_BONUS_TRAITS.map((trait) => {
                    const imageFile = `tft14_emblem_${trait.replace(/ /g, "").toLowerCase()}.tft_set14.png`;
                    const count = filters[trait] || 0;

                    return (
                        <li key={trait} className="flex flex-col items-center">
                            <div className="relative w-12 h-12 mb-1">
                                <Tooltip text={trait}>
                                    <Image
                                        src={`/emblems/${imageFile}`}
                                        alt={trait}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                        draggable={false}
                                    />
                                </Tooltip>
                            </div>
                            {/* Counter controls unchanged */}
                            <div className="flex items-center gap-[1.5px]">
                                <button
                                    onClick={() => updateFilter(trait, -1)}
                                    disabled={count === 0}
                                    aria-label={`Decrease ${trait} count, current ${count}`}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 disabled:opacity-50"
                                >
                                    <LuMinus className="w-4 h-4 text-zinc-200" />
                                </button>
                                <span
                                    aria-live="polite"
                                    aria-atomic="true"
                                    className={`w-6 text-center ${
                                        count > 0 ? "text-emerald-400" : "text-white"
                                    }`}
                                >
                  {count}
                </span>
                                <button
                                    onClick={() => updateFilter(trait, 1)}
                                    disabled={count === MAX_BONUS_MAP[trait] || totalBonus >= 4}
                                    aria-label={`Increase ${trait} count, current ${count}`}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 disabled:opacity-50"
                                >
                                    <LuPlus className="w-4 h-4 text-zinc-200" />
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
