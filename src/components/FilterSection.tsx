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
];

const MAX_BONUS_MAP: Record<string, number> = {
    "Anima Squad": 2,
    "BoomBot": 2,
    "Divinicorp": 1,
    "Exotech": 2,
    "Golden Ox": 2,
    "Street Demon": 2,
    "Syndicate": 2,
    "Bastion": 2,
    "Bruiser": 2,
    "Dynamo": 2,
    "Executioner": 2,
    "Marksman": 2,
    "Rapidfire": 2,
    "Slayer": 2,
    "Strategist": 2,
    "Techie": 2,
    "Vanguard": 2,
};

export interface FilterSectionProps {
    filters: Record<string, number>;
    setFiltersAction: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
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

    const updateFilter = useCallback(
        (trait: string, delta: number) => {
            setFiltersAction((prev) => {
                const current = prev[trait] ?? 0;
                const newValue = Math.min(
                    Math.max(current + delta, 0),
                    MAX_BONUS_MAP[trait]
                );
                const next = { ...prev };
                if (newValue > 0) {
                    next[trait] = newValue;
                } else {
                    // remove zeroed traits so our object stays small
                    delete next[trait];
                }
                return next;
            });
        },
        [setFiltersAction]
    );

    const resetFilters = () => {
        setFiltersAction({});
    };

    const [filterHelpOpen, setFilterHelpOpen] = useState(false);

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4">
            {/* Top area: Title and inline icon buttons */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl text-white font-bold">Emblem Filters</h2>
                    <p className="text-zinc-400 text-sm">
                        Add your emblems to see comps that use the fewest units and lowest cost.
                        (up to 4).
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Toggle Comp Traits Button */}
                    <div className="relative group">
                        <button
                            onClick={() => setHideTraitsAction(!hideTraits)}
                            className={`p-2 rounded cursor-pointer ${
                                hideTraits
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-emerald-500 hover:bg-emerald-600"
                            } text-white`}
                        >
                            {hideTraits ? <LuEyeOff className="w-5 h-5" /> : <LuEye className="w-5 h-5" />}
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Toggle Comp Traits
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
            </span>
                    </div>
                    {/* Reset Filters Button */}
                    <div className="relative group">
                        <button
                            onClick={resetFilters}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuRefreshCw className="w-5 h-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Reset Filters
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
            </span>
                    </div>
                    {/* Filter Help Button */}
                    <div className="relative group">
                        <button
                            onClick={() => setFilterHelpOpen(true)}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuCircleHelp className="w-5 h-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Filter Help
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
            </span>
                    </div>
                </div>
            </div>

            <Modal
                title="Filtering Help"
                isOpen={filterHelpOpen}
                onClose={() => setFilterHelpOpen(false)}
            >
                <p>
                    Use the emblem filters to select which emblems you have. The tool will then show you team compositions that require the fewest units and the lowest cost.
                </p>
                <p className="mt-2">Each configuration shows up to 50 comps.</p>
            </Modal>

            {/* Emblem grid: separate the image from the +/– controls */}
            <div className="mt-4 flex flex-wrap gap-2">
                {ELIGIBLE_BONUS_TRAITS.map((trait) => {
                    const imageFile = `tft14_emblem_${trait.replace(/ /g, "").toLowerCase()}.tft_set14.png`;
                    const count = filters[trait] || 0;
                    return (
                        <div key={trait} className="flex flex-col items-center">
                            <div className="relative w-12 h-12 mb-1">
                                {/* Only the image gets the hover popover */}
                                <div className="group relative">
                                    <Image
                                        src={`/emblems/${imageFile}`}
                                        alt={trait}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                        draggable={false}
                                    />
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {trait}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
                  </span>
                                </div>
                            </div>
                            {/* Controls: Fixed-width number container so they don't change width */}
                            <div className="flex items-center gap-[1.5px]">
                                <button
                                    onClick={() => updateFilter(trait, -1)}
                                    disabled={count === 0}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:hover:bg-zinc-800"
                                >
                                    <LuMinus className="w-4 h-4 text-zinc-200" />
                                </button>
                                <span className={count > 0 ? "w-6 text-center text-emerald-400" : "w-6 text-center text-white"}>
                  {count}
                </span>
                                <button
                                    onClick={() => updateFilter(trait, 1)}
                                    disabled={count === MAX_BONUS_MAP[trait] || totalBonus >= 4}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:hover:bg-zinc-800"
                                >
                                    <LuPlus className="w-4 h-4 text-zinc-200" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
