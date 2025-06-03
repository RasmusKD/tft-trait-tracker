'use client';
import Image from 'next/image';
import { useId, useMemo } from 'react';
import { GiTwoCoins } from 'react-icons/gi';
import {
    getChampionTier,
    getChampionBorderClass,
    getChampionTraits,
} from '@/utils/championUtils';
import { getChampionDisplayName } from '@/utils/displayNames';

export interface ChampionTooltipProps {
    setIdentifier: string;
    champion: string;
    size?: number;
}

export default function ChampionTooltip({
    setIdentifier,
    champion,
    size = 64,
}: ChampionTooltipProps) 
{
    const tooltipId = useId();
    const setFolder = useMemo(() => setIdentifier.toLowerCase(), [ setIdentifier ]);
    const displayName = getChampionDisplayName(champion);
    const championImageKey = useMemo(
        () => champion.replace(/[\s.'()/-]/g, '').toLowerCase(),
        [ champion ]
    );

    const borderClass = useMemo(
        () => getChampionBorderClass(setIdentifier, champion),
        [ setIdentifier, champion ]
    );
    const tier = useMemo(
        () => getChampionTier(setIdentifier, champion),
        [ setIdentifier, champion ]
    );
    const traits = useMemo(
        () => getChampionTraits(setIdentifier, champion),
        [ setIdentifier, champion ]
    );

    return (
        <div className="relative group flex flex-col items-center gap-1">
            <div
                style={ { width: size, height: size } }
                className={ `relative border-2 ${ borderClass } rounded overflow-hidden` }
            >
                <Image
                    src={ `/champions/${ setFolder }/${ championImageKey }.png` }
                    alt={ champion }
                    fill
                    sizes={ `${ size }px` }
                    className="object-contain"
                    draggable={ false }
                    onError={ (e) => 
                    {
                        e.currentTarget.style.display = 'none';
                        console.warn(
                            `Champion image not found for tooltip: /champions/${ setFolder }/${ championImageKey }.png (Champion: ${ champion })`
                        );
                    } }
                />
            </div>
            <span className="text-xs font-medium text-zinc-200">{ displayName }</span>
            <div
                role="tooltip"
                id={ tooltipId }
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
                <div className="flex items-center justify-between w-full">
                    <p className="font-bold text-sm text-white">{ champion }</p>
                    <div className="flex items-center gap-1">
                        <GiTwoCoins className="size-4 text-yellow-400" />
                        <span className="text-sm text-white">{ tier }</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    { traits.map((trait, i) => 
                    {
                        const traitIconFileName = trait.replace(/[\s/]/g, '');
                        const imagePath = `/trait-icons/${ setFolder }/${ traitIconFileName }.png`;
                        return (
                            <span
                                key={ `${ trait }-${ i }` }
                                className="flex items-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded px-1 py-0.5 text-sm"
                            >
                                <Image
                                    src={ imagePath }
                                    loading="lazy"
                                    alt={ `${ trait } Icon` }
                                    width={ 16 }
                                    height={ 16 }
                                    className="mr-1"
                                    onError={ (e) => 
                                    {
                                        e.currentTarget.style.display = 'none';
                                        console.warn(`Trait icon not found for tooltip: ${ imagePath }`);
                                    } }
                                />
                                { trait }
                            </span>
                        );
                    }) }
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45" />
            </div>
        </div>
    );
}
