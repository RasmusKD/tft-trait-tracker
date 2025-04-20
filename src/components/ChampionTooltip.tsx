"use client";
import Image from "next/image";
import { useId } from "react";
import { GiTwoCoins } from "react-icons/gi";
import {
    getChampionTier,
    getChampionBorderClass,
    getChampionTraits,
} from "@/utils/championUtils";

export interface ChampionTooltipProps {
    champion: string;
    /** pixel size for the square icon */
    size?: number;
}

export default function ChampionTooltip({
                                            champion,
                                            size = 64,
                                        }: ChampionTooltipProps) {
    const tooltipId = useId();
    const key = champion.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const borderClass = getChampionBorderClass(champion);
    const tier = getChampionTier(champion);
    const traits = getChampionTraits(champion);

    return (
        <div className="relative group flex flex-col items-center gap-1">
            {/* Icon + Name */}
            <div
                style={{ width: size, height: size }}
                className={`relative border-2 ${borderClass} rounded overflow-hidden`}
            >
                <Image
                    src={`/champions/${key}.png`}
                    alt={champion}
                    fill
                    sizes={`${size}px`}
                    className="object-contain"
                    draggable={false}
                />
            </div>
            <span className="text-xs font-medium text-zinc-200">{champion}</span>

            {/* Tooltip (with arrow above champion) */}
            <div
                role="tooltip"
                id={tooltipId}
                className="
          absolute bottom-[calc(100%+0.5rem)] left-1/2
          transform -translate-x-1/2 scale-95
          group-hover:scale-100
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          pointer-events-none z-10
          w-40 flex flex-col gap-2
          bg-zinc-800 bg-opacity-90 p-3 rounded-lg
        "
            >
                {/* Header: Name & Cost */}
                <div className="flex items-center justify-between w-full">
                    <p className="font-bold text-sm text-white">{champion}</p>
                    <div className="flex items-center gap-1">
                        <GiTwoCoins className="size-4 text-yellow-400" />
                        <span className="text-sm text-white">{tier}</span>
                    </div>
                </div>

                {/* Traits List */}
                <div className="flex flex-col gap-1">
                    {traits.map((trait, i) => (
                        <span
                            key={i}
                            className="flex items-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded px-1 py-0.5 text-sm"
                        >
              <Image
                  src={`/trait-icons/Trait_Icon_14_${trait.replace(/ /g, "")}.TFT_Set14.png`}
                  loading="lazy"
                  alt={trait}
                  width={16}
                  height={16}
                  className="mr-1"
              />
                            {trait}
            </span>
                    ))}
                </div>

                {/* Arrow */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45" />
            </div>
        </div>
    );
}