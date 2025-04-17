"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { LuCheck, LuCopy } from "react-icons/lu";
import { GiTwoCoins } from "react-icons/gi";
import { getChampionTier, getChampionBorderClass, getChampionTraits, sortChampionsByTierAndName } from "@/utils/championUtils";
import { getActivatedTraits } from "@/utils/traits";
import { buildTeamPlannerCode } from "@/utils/teamPlanner";

export interface CompData {
    selected_champions: string[];
}

export interface CompSectionProps {
    compData: CompData;
    hideTraits?: boolean;
    filters: Record<string, number>;
}

export default function CompSection({ compData, hideTraits, filters }: CompSectionProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        const code = buildTeamPlannerCode(compData.selected_champions, "TFTSet14");
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy team planner code:", error);
        }
    };

    const sortedChampions = useMemo(
        () => sortChampionsByTierAndName(compData.selected_champions),
        [compData.selected_champions]
    );

    const activatedTraits = useMemo(
        () => getActivatedTraits(compData.selected_champions, filters),
        [compData.selected_champions, filters]
    );

    const computedTotal = useMemo(
        () => sortedChampions.reduce((sum, champ) => sum + getChampionTier(champ), 0),
        [sortedChampions]
    );

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-xl rounded p-4 gap-4 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h2 className="text-xl text-white font-bold">Comp Details</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{computedTotal}</span>
                        <GiTwoCoins className="size-5 text-yellow-400" />
                    </div>
                    <div className="relative group">
                        <button
                            onClick={copyToClipboard}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                            aria-label="Copy Team Code"
                        >
                            {copied ? <LuCheck className="w-4 h-4 text-emerald-400" /> : <LuCopy className="w-4 h-4 text-white" />}
                        </button>
                        <span
                            role="tooltip"
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-90 text-white text-xs rounded whitespace-nowrap text-center pointer-events-none z-10"
                        >
              {copied ? "Team Code Copied!" : "Copy Team Code"}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-2 h-2 bg-zinc-800 rotate-45"></div>
            </span>
                    </div>
                </div>
            </div>

            {!hideTraits && (
                <div className="flex flex-wrap gap-2">
                    {activatedTraits.map((trait, i) => {
                        const traitIcon = `/trait-icons/Trait_Icon_14_${trait.replace(/ /g, "")}.TFT_Set14.png`;
                        return (
                            <span key={i} className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-sm">
                <Image src={traitIcon} alt={trait} width={20} height={20} className="mr-1" />
                                {trait}
              </span>
                        );
                    })}
                </div>
            )}

            <div className="flex flex-wrap gap-4">
                {sortedChampions.map((champion, idx) => {
                    const championFile = champion.replace(/[^a-zA-Z]/g, "").toLowerCase();
                    const borderClass = getChampionBorderClass(champion);
                    return (
                        <div key={idx} className="relative group flex flex-col items-center gap-1">
                            <div className={`relative size-16 border-2 ${borderClass} rounded overflow-hidden`}>
                                <Image
                                    src={`/champions/${championFile}.png`}
                                    alt={champion}
                                    fill
                                    sizes="64px"
                                    className="object-contain"
                                    draggable={false}
                                />
                            </div>
                            <span className="text-xs font-medium text-zinc-200">{champion}</span>

                            <div
                                role="tooltip"
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 scale-95 group-hover:translate-y-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 w-40 flex flex-col gap-2 bg-zinc-800 bg-opacity-90 p-3 rounded-lg"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <p className="font-bold text-sm text-white" id={`tooltip-${champion}`}>
                                        {champion}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <GiTwoCoins className="size-4 text-yellow-400" />
                                        <span className="text-sm text-white">{getChampionTier(champion)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {getChampionTraits(champion).map((trait, ti) => {
                                        const traitIcon = `/trait-icons/Trait_Icon_14_${trait.replace(/ /g, "")}.TFT_Set14.png`;
                                        return (
                                            <span
                                                key={ti}
                                                className="flex items-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded px-1 py-0.5 text-sm bold"
                                            >
                        <Image src={traitIcon} alt={trait} width={16} height={16} className="mr-1" />
                                                {trait}
                      </span>
                                        );
                                    })}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-2 h-2 bg-zinc-800 rotate-45"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
