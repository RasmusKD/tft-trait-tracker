'use client';
import { useMemo, useState, useId } from 'react';
import Image from 'next/image';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { GiTwoCoins } from 'react-icons/gi';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import ChampionTooltip from './ChampionTooltip';
import Tooltip from './Tooltip';
import {
    getChampionTier,
    sortChampionsByTierAndName,
} from '@/utils/championUtils';
import { getActivatedTraits } from '@/utils/traits';
import { buildTeamPlannerCode } from '@/utils/teamPlanner';
import { getSetConfig } from '@/utils/championMapping';

export interface CompData {
    selected_champions: string[];
}

export interface Variant {
    baseOnly: string;
    variant: string;
}

export interface CompSectionProps {
    setIdentifier: string;
    compData: CompData;
    hideTraits?: boolean;
    filters: Record<string, number>;
    compact?: boolean;
    variants?: Variant[];
    isSmallScreen?: boolean;
}

export default function CompSection({
    setIdentifier,
    compData,
    hideTraits,
    filters,
    compact = false,
    variants = [],
    isSmallScreen = false,
}: CompSectionProps) 
{
    const [ copiedMain, setCopiedMain ] = useState(false);
    const [ copiedCombo, setCopiedCombo ] = useState(false);
    const [ openDetails, setOpenDetails ] = useState<Record<string, boolean>>({});
    const compId = useId();

    const setConfig = useMemo(
        () => getSetConfig(setIdentifier),
        [ setIdentifier ]
    );
    const setFolder = useMemo(
        () => setIdentifier.toLowerCase(),
        [ setIdentifier ]
    ); // e.g., "tftset14"

    const copyMain = async () => 
    {
        if (!setConfig) return;
        const code = buildTeamPlannerCode(
            setIdentifier,
            compData.selected_champions
        );
        try 
        {
            await navigator.clipboard.writeText(code);
            setCopiedMain(true);
            setTimeout(() => setCopiedMain(false), 1000);
        }
        catch (err) 
        {
            console.error('Failed to copy main team code:', err);
        }
    };

    const variantChamps = useMemo(
        () => Array.from(new Set(variants.map((v) => v.variant))),
        [ variants ]
    );

    const comboList = useMemo(() => 
    {
        if (!setConfig) return [];
        const arr = [ ...compData.selected_champions, ...variantChamps ];
        return arr.slice(0, setConfig.targetSlots);
    }, [ compData.selected_champions, variantChamps, setConfig ]);

    const copyCombo = async () => 
    {
        if (!setConfig || comboList.length === 0) return;
        const code = buildTeamPlannerCode(setIdentifier, comboList);
        try 
        {
            await navigator.clipboard.writeText(code);
            setCopiedCombo(true);
            setTimeout(() => setCopiedCombo(false), 1000);
        }
        catch (err) 
        {
            console.error('Failed to copy combo team code:', err);
        }
    };

    const sortedChampions = useMemo(
        () =>
            sortChampionsByTierAndName(
                setIdentifier,
                compData.selected_champions
            ),
        [ setIdentifier, compData.selected_champions ]
    );

    const activatedTraits = useMemo(
        () =>
            getActivatedTraits(
                setIdentifier,
                compData.selected_champions,
                filters
            ),
        [ setIdentifier, compData.selected_champions, filters ]
    );

    const computedTotal = useMemo(
        () =>
            sortedChampions.reduce(
                (sum, champ) => sum + getChampionTier(setIdentifier, champ),
                0
            ),
        [ setIdentifier, sortedChampions ]
    );

    const variantMap = useMemo(() => 
    {
        const map: Record<string, string[]> = {};
        variants.forEach(({ baseOnly, variant }) => 
        {
            if (!map[baseOnly]) map[baseOnly] = [];
            if (!map[baseOnly].includes(variant)) map[baseOnly].push(variant);
        });
        return map;
    }, [ variants ]);

    if (!setConfig) 
    {
        return (
            <section className="bg-zinc-900/75 border border-zinc-800 shadow-xl rounded p-4">
                <p className="text-red-500">
                    Error: Comp details configuration not available for{ ' ' }
                    { setIdentifier.replace('TFTSet', 'Set ') }.
                </p>
            </section>
        );
    }

    return (
        <section
            aria-labelledby={ `${ compId }-title` }
            className="bg-zinc-900/75 border border-zinc-800 shadow-xl rounded p-4 gap-4 flex flex-col"
        >
            { /* Header */ }
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <h2
                    id={ `${ compId }-title` }
                    className="text-xl text-white font-bold"
                >
                    Comp Details
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold">{ computedTotal }</span>
                        <GiTwoCoins className="size-5 text-yellow-400" />
                    </div>
                    <Tooltip
                        text={ copiedMain ? 'Team Code Copied!' : 'Copy Team Code' }
                    >
                        <button
                            onClick={ copyMain }
                            aria-label={
                                copiedMain
                                    ? 'Team code copied'
                                    : 'Copy team code'
                            }
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            { copiedMain ? (
                                <LuCheck className="size-5 text-emerald-400" />
                            ) : (
                                <LuCopy className="size-5 text-white" />
                            ) }
                        </button>
                    </Tooltip>
                    { variantChamps.length > 0 && (
                        <Tooltip
                            text={
                                copiedCombo
                                    ? 'Team code Copied!'
                                    : 'Copy Team Code + Variants'
                            }
                        >
                            <button
                                onClick={ copyCombo }
                                aria-label={
                                    copiedCombo
                                        ? 'Combined code copied'
                                        : 'Copy combined code'
                                }
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                            >
                                { copiedCombo ? (
                                    <LuCheck className="size-5 text-emerald-400" />
                                ) : (
                                    <LuCopy className="size-5 text-blue-400" />
                                ) }
                            </button>
                        </Tooltip>
                    ) }
                </div>
            </div>
            { /* Traits */ }
            { !hideTraits && (
                <div className="flex flex-wrap gap-2">
                    { activatedTraits.map((trait, i) => 
                    {
                        const traitIconFileName = trait.replace(/[\s/]/g, '');
                        const imagePath = `/trait-icons/${ setFolder }/${ traitIconFileName }.webp`;
                        return (
                            <span
                                key={ `${ trait }-${ i }` }
                                className="flex items-center bg-zinc-800 text-zinc-200 rounded px-2 py-1 text-sm"
                            >
                                <Image
                                    src={ imagePath }
                                    loading="lazy"
                                    alt={ `${ trait } Icon` }
                                    width={ 20 }
                                    height={ 20 }
                                    className="mr-1"
                                    draggable={ false }
                                    onError={ (e) => 
                                    {
                                        e.currentTarget.style.display = 'none';
                                        console.warn(
                                            `Trait icon not found: ${ imagePath }`
                                        );
                                    } }
                                />
                                { trait }
                            </span>
                        );
                    }) }
                </div>
            ) }
            <ul role="list" className="flex flex-wrap gap-0.25 sm:gap-2 md:gap-4">
                { sortedChampions.map((champ) => 
                {
                    const alts = variantMap[champ] || [];
                    return (
                        <li
                            key={ champ }
                            className="relative flex flex-col items-center gap-1 list-none"
                        >
                            <ChampionTooltip
                                setIdentifier={ setIdentifier }
                                champion={ champ }
                                size={ isSmallScreen ? 48 : 64 }
                            />
                            { compact && alts.length > 0 && (
                                <>
                                    <button
                                        onClick={ () =>
                                            setOpenDetails((prev) => ({
                                                ...prev,
                                                [champ]: !prev[champ],
                                            }))
                                        }
                                        className="mt-1 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-500 cursor-pointer"
                                    >
                                        <span className="w-2 sm:w-4 flex justify-center">
                                            { openDetails[champ] ? (
                                                <FaChevronDown size={ isSmallScreen ? 8 : 12 }/>
                                            ) : (
                                                <FaChevronRight size={ isSmallScreen ? 8 : 12 }/>
                                            ) }
                                        </span>
                                        Variants
                                    </button>
                                    { openDetails[champ] && (
                                        <div className="flex flex-wrap gap-2 mt-1 justify-center">
                                            { alts.map((alt) => (
                                                <ChampionTooltip
                                                    key={ alt }
                                                    setIdentifier={
                                                        setIdentifier
                                                    }
                                                    champion={ alt }
                                                    size={ 48 }
                                                />
                                            )) }
                                        </div>
                                    ) }
                                </>
                            ) }
                        </li>
                    );
                }) }
            </ul>
        </section>
    );
}