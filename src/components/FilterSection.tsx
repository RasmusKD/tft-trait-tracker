"use client";
import { useEffect } from "react";
import Image from "next/image";
import { Minus, Plus, HelpCircle } from "lucide-react";

export interface FilterSectionProps {
    filters: Record<string, number>;
    setFiltersAction: (
        filters:
            | Record<string, number>
            | ((prev: Record<string, number>) => Record<string, number>)
    ) => void;
}

export default function FilterSection({
                                          filters,
                                          setFiltersAction,
                                      }: FilterSectionProps) {
    // Eligible bonus traits: all traits from your data excluding "Cyberboss", "Cypher", "Nitro", and "A.M.P".
    const eligibleBonusTraits = [
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

    // Maximum bonus allowed per trait (Divinicorp is capped at 1, the rest at 2)
    const maxBonusMap: Record<string, number> = {
        "Anima Squad": 2,
        "BoomBot": 2,
        "Divinicorp": 1, // capped at 1
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

    // Initialize filters on first render if not already set
    useEffect(() => {
        const newFilters: Record<string, number> = {};
        eligibleBonusTraits.forEach((trait) => {
            newFilters[trait] = filters[trait] ?? 0;
        });
        setFiltersAction(newFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateFilter = (trait: string, delta: number) => {
        setFiltersAction((prev: Record<string, number>) => {
            const current = prev[trait] || 0;
            // Ensure new value does not go below 0 or above the maximum allowed.
            const newValue = Math.min(Math.max(current + delta, 0), maxBonusMap[trait]);
            return { ...prev, [trait]: newValue };
        });
    };

    const resetFilters = () => {
        const newFilters: Record<string, number> = {};
        eligibleBonusTraits.forEach((trait) => {
            newFilters[trait] = 0;
        });
        setFiltersAction(newFilters);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg rounded p-4 mb-6">
            <div className="mb-4">
                <h2 className="text-xl text-white">Emblem Filters</h2>
                <p className="text-zinc-400 text-sm">
                    Adjust the emblem bonus counts for each trait to filter precomputed comps.
                    (Maximum total bonus allowed is 4.)
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {eligibleBonusTraits.map((trait) => {
                    // Convert trait name to lowercase without spaces for the filename.
                    // Example: "Anima Squad" -> "tft14_emblem_animasquad.tft_set14.png"
                    const imageFile = `tft14_emblem_${trait.replace(/ /g, "").toLowerCase()}.tft_set14.png`;
                    return (
                        <div key={trait} className="flex flex-col items-center">
                            <div className="relative w-12 h-12 mb-2">
                                <Image
                                    src={`/emblems/${imageFile}`}
                                    alt={trait}
                                    fill
                                    className="object-contain"
                                    draggable={false}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => updateFilter(trait, -1)}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700"
                                >
                                    <Minus className="w-4 h-4 text-zinc-200" />
                                </button>
                                <span className="text-white">{filters[trait] || 0}</span>
                                <button
                                    onClick={() => updateFilter(trait, 1)}
                                    className="p-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700"
                                >
                                    <Plus className="w-4 h-4 text-zinc-200" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
                <button
                    onClick={resetFilters}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
                >
                    Reset
                </button>
                <button
                    onClick={() =>
                        alert(
                            "Help: Adjust the emblem bonus counts to filter the comps based on available trait bonuses. Maximum total bonus across all traits is 4."
                        )
                    }
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded"
                >
                    <HelpCircle className="w-5 h-5 inline" />
                    <span className="ml-2">Help</span>
                </button>
            </div>
        </div>
    );
}
