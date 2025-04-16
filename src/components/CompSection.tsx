"use client";
import {useMemo, useState} from "react";
import Image from "next/image";
import { LuCheck, LuCopy } from "react-icons/lu";
import { GiTwoCoins } from "react-icons/gi";
import { getChampionTier, getChampionBorderClass, getChampionTraits } from "@/utils/champion";
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


    // Sort champions: first by tier then alphabetically.
    const sortedChampions = useMemo(() => {
        return compData.selected_champions.slice().sort((a: string, b: string) => {
            const tierA = getChampionTier(a);
            const tierB = getChampionTier(b);
            if (tierA !== tierB) return tierA - tierB;
            return a.localeCompare(b);
        });
    }, [compData.selected_champions]);


    // Compute activated traits on the fly.
    const activatedTraits = useMemo(() => {
        return getActivatedTraits(compData.selected_champions, filters);
    }, [compData.selected_champions, filters]);

    // Compute total cost on the fly.
    const computedTotal = useMemo(() => {
        return sortedChampions.reduce((sum, champ) => sum + getChampionTier(champ), 0);
    }, [sortedChampions]);

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-xl rounded p-4 gap-4 flex flex-col">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl text-white font-bold">Comp Details</h2>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{computedTotal}</span>
                        <GiTwoCoins className="size-5 text-yellow-400"/>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative group">
                            <button
                                onClick={copyToClipboard}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                            >
                                {copied ? (
                                    <LuCheck className="w-4 h-4 text-emerald-400"/>
                                ) : (
                                    <LuCopy className="w-4 h-4 text-white"/>
                                )}
                                <span className="sr-only">Copy Team Code</span>
                            </button>
                            <span
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
      {copied ? "Team Code Copied!" : "Copy Team Code"}
                                <div
                                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
    </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {!hideTraits && (
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-2">
                            {activatedTraits.map((trait: string, index: number) => {
                                const traitIcon = `/trait-icons/Trait_Icon_14_${trait.replace(/ /g, "")}.TFT_Set14.png`;
                                return (
                                    <span key={index}
                                          className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-sm">
                    <Image src={traitIcon} alt={trait} width={20} height={20} className="mr-1"/>
                                        {trait}
                  </span>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div>
                    <div className="flex flex-wrap gap-2">
                        {sortedChampions.map((champion: string, index: number) => {
                            const championFile = champion.replace(/[\s.'-]/g, "").toLowerCase();
                            const borderClass = getChampionBorderClass(champion);
                            return (
                                <div key={index} className="flex flex-col items-center group relative gap-1">
                                    <div
                                        className={`relative size-16 border-2 ${borderClass} rounded overflow-hidden`}>
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
                                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-90 text-white text-xs rounded text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        <p className="font-bold">{champion}</p>
                                        <p className="mt-1">{getChampionTraits(champion).join(", ") || ""}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
