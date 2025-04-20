// components/CompSection.tsx
"use client";
import { useMemo, useState, useId } from "react";
import Image from "next/image";
import { LuCheck, LuCopy } from "react-icons/lu";
import { GiTwoCoins } from "react-icons/gi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import ChampionTooltip from "./ChampionTooltip";
import Tooltip from "./Tooltip";
import {
    getChampionTier,
    sortChampionsByTierAndName,
} from "@/utils/championUtils";
import { getActivatedTraits } from "@/utils/traits";
import { buildTeamPlannerCode } from "@/utils/teamPlanner";

export interface CompData {
    selected_champions: string[];
}

export interface Variant {
    baseOnly: string;
    variant: string;
}

export interface CompSectionProps {
    compData: CompData;
    hideTraits?: boolean;
    filters: Record<string, number>;
    compact?: boolean;
    variants?: Variant[];
}

export default function CompSection({
                                        compData,
                                        hideTraits,
                                        filters,
                                        compact = false,
                                        variants = [],
                                    }: CompSectionProps) {
    const [copiedMain, setCopiedMain] = useState(false);
    const [copiedCombo, setCopiedCombo] = useState(false);
    const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
    const compId = useId();

    // existing comp code
    const copyMain = async () => {
        const code = buildTeamPlannerCode(
            compData.selected_champions,
            "TFTSet14"
        );
        try {
            await navigator.clipboard.writeText(code);
            setCopiedMain(true);
            setTimeout(() => setCopiedMain(false), 1000);
        } catch {}
    };

    // new: combo code (main + variant champions, up to 10)
    const variantChamps = useMemo(
        () => Array.from(new Set(variants.map((v) => v.variant))),
        [variants]
    );
    const comboList = useMemo(() => {
        const arr = [...compData.selected_champions, ...variantChamps];
        return arr.slice(0, 10);
    }, [compData.selected_champions, variantChamps]);
    const copyCombo = async () => {
        const code = buildTeamPlannerCode(comboList, "TFTSet14");
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCombo(true);
            setTimeout(() => setCopiedCombo(false), 1000);
        } catch {}
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
        () =>
            sortedChampions.reduce(
                (sum, champ) => sum + getChampionTier(champ),
                0
            ),
        [sortedChampions]
    );

    // map each base champ → its variant(s)
    const variantMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        variants.forEach(({ baseOnly, variant }) => {
            if (!map[baseOnly]) map[baseOnly] = [];
            if (!map[baseOnly].includes(variant)) map[baseOnly].push(variant);
        });
        return map;
    }, [variants]);

    return (
        <section
            aria-labelledby={`${compId}-title`}
            className="bg-zinc-900/75 border border-zinc-800 shadow-xl rounded p-4 gap-4 flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h2 id={`${compId}-title`} className="text-xl text-white font-bold">
                    Comp Details
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{computedTotal}</span>
                        <GiTwoCoins className="size-5 text-yellow-400" />
                    </div>
                    {/* main copy button */}
                    <Tooltip
                        text={
                            copiedMain ? "Team Code Copied!" : "Copy Team Code"
                        }
                    >
                        <button
                            onClick={copyMain}
                            aria-label={
                                copiedMain
                                    ? "Team code copied"
                                    : "Copy team code"
                            }
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                        >
                            {copiedMain ? (
                                <LuCheck className="size-5 text-emerald-400" />
                            ) : (
                                <LuCopy className="size-5 text-white" />
                            )}
                        </button>
                    </Tooltip>

                    {/* combined copy button (only if variants exist) */}
                    {variantChamps.length > 0 && (
                        <Tooltip
                            text={
                                copiedCombo
                                    ? "Team code Copied!"
                                    : "Copy Team Code + Variants"
                            }
                        >
                            <button
                                onClick={copyCombo}
                                aria-label={
                                    copiedCombo
                                        ? "Combined code copied"
                                        : "Copy combined code"
                                }
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"
                            >
                                {copiedCombo ? (
                                    <LuCheck className="size-5 text-emerald-400" />
                                ) : (
                                    <LuCopy className="size-5 text-blue-400" />
                                )}
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Traits */}
            {!hideTraits && (
                <div className="flex flex-wrap gap-2">
                    {activatedTraits.map((trait, i) => (
                        <span
                            key={i}
                            className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-sm"
                        >
              <Image
                  src={`/trait-icons/Trait_Icon_14_${trait.replace(
                      / /g,
                      ""
                  )}.TFT_Set14.png`}
                  loading="lazy"
                  alt={trait}
                  width={20}
                  height={20}
                  className="mr-1"
              />
                            {trait}
            </span>
                    ))}
                </div>
            )}

            {/* Champions & Variants */}
            <ul role="list" className="flex flex-wrap gap-4">
                {sortedChampions.map((champ) => {
                    const alts = variantMap[champ] || [];
                    return (
                        <li
                            key={champ}
                            className="relative flex flex-col items-center gap-1 list-none"
                        >
                            {/* main champion */}
                            <ChampionTooltip champion={champ} size={64} />

                            {/* inline variants */}
                            {compact && alts.length > 0 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setOpenDetails((prev) => ({
                                                ...prev,
                                                [champ]: !prev[champ],
                                            }))
                                        }
                                        className="mt-1 flex items-center gap-1 text-xs text-blue-400"
                                    >
                    <span className="w-4 flex justify-center">
                      {openDetails[champ] ? (
                          <FaChevronDown />
                      ) : (
                          <FaChevronRight />
                      )}
                    </span>
                                        Variants
                                    </button>
                                    {openDetails[champ] && (
                                        <div className="flex flex-wrap gap-2 mt-1 justify-center">
                                            {alts.map((alt) => (
                                                <ChampionTooltip
                                                    key={alt}
                                                    champion={alt}
                                                    size={48}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
