'use client';
import React, { useCallback, useState, useMemo } from 'react';
import Image from 'next/image';
import {
    LuMinus,
    LuPlus,
    LuRefreshCw,
    LuCircleHelp,
} from 'react-icons/lu';
import Modal from '../components/Modal';
import Tooltip from '../components/Tooltip';
import { getSetConfig } from '@/utils/championMapping';

export interface FilterSectionProps {
    setIdentifier: string;
    filters: Record<string, number>;
    setFiltersAction: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
}

export default function FilterSection({
    setIdentifier,
    filters,
    setFiltersAction,
}: FilterSectionProps)
{
    const totalBonus = Object.values(filters).reduce(
        (acc, val) => acc + val,
        0
    );
    const [ filterHelpOpen, setFilterHelpOpen ] = useState(false);

    const setConfig = useMemo(() => getSetConfig(setIdentifier), [ setIdentifier ]);
    const setFolder = useMemo(() => setIdentifier.toLowerCase(), [ setIdentifier ]); // e.g., "tftset14"

    const eligibleEmblemTraits = useMemo(() =>
    {
        return setConfig?.eligibleEmblemTraits?.slice().sort() || [];
    }, [ setConfig ]);

    const singleActivationTraits = useMemo(() =>
    {
        return new Set(setConfig?.singleActivationEmblemTraits || []);
    }, [ setConfig ]);

    const hasFilters = useMemo(() => totalBonus > 0, [ totalBonus ]);

    const updateFilter = useCallback(
        (trait: string, delta: number) =>
        {
            setFiltersAction((prev) =>
            {
                const current = prev[trait] ?? 0;
                const maxForTrait = singleActivationTraits.has(trait) ? 1 : 2;
                const newValue = Math.min(
                    Math.max(current + delta, 0),
                    maxForTrait
                );
                const next = { ...prev };
                if (newValue > 0) next[trait] = newValue;
                else delete next[trait];
                return next;
            });
        },
        [ setFiltersAction, singleActivationTraits ]
    );

    const resetFilters = () => setFiltersAction({});

    if (!setConfig)
    {
        return (
            <section className="bg-zinc-900/75 border border-zinc-800 shadow-lg rounded p-4 min-w-0">
                <p className="text-red-500">Error: Filter configuration not available for the selected set.</p>
            </section>
        );
    }

    if (eligibleEmblemTraits.length === 0 && setConfig)
    {
        return (
            <section
                aria-labelledby="filter-heading"
                className="bg-zinc-900/75 border border-zinc-800 shadow-lg rounded p-4 min-w-0"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="filter-heading" className="text-xl text-white font-bold">
                            Emblem Filters
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            No eligible emblem traits defined for { setIdentifier.replace('TFTSet', 'Set ') }.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            aria-labelledby="filter-heading"
            className="bg-zinc-900/75 border border-zinc-800 shadow-lg rounded p-4 min-w-0"
        >
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
                    <Tooltip text={ hasFilters ? 'Reset Filters' : 'No filters to reset' }>
                        <button
                            onClick={ resetFilters }
                            disabled={ !hasFilters }
                            aria-label="Reset Filters"
                            className={ `p-2 rounded ${
                                hasFilters
                                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer'
                                    : 'bg-zinc-800/50 text-zinc-500'
                            }` }
                        >
                            <LuRefreshCw className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Filter Help">
                        <button
                            onClick={ () => setFilterHelpOpen(true) }
                            aria-haspopup="dialog"
                            aria-label="Filter Help"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuCircleHelp className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>
            <Modal
                title="Filtering Help"
                isOpen={ filterHelpOpen }
                onCloseAction={ () => setFilterHelpOpen(false) }
            >
                <p>
                    Use the emblem filters to select which emblems you have. The tool
                    will then show you team compositions that require the fewest units
                    and the lowest cost.
                </p>
                <p className="mt-2">Each configuration shows up to 50 comps.</p>
                <p className="mt-2">
                    You can add up to 4 bonus traits in total. Most traits can have up to 2 bonuses, while some only have 1.
                </p>
            </Modal>
            <ul
                role="list"
                className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 2xl:grid-cols-17 gap-2"
            >
                { eligibleEmblemTraits.map((trait) =>
                {
                    // Cleaned trait name for filename (lowercase, no spaces)
                    const emblemFileName = trait.replace(/[\s/]/g, '').toLowerCase();
                    const imagePath = `/emblems/${ setFolder }/${ emblemFileName }.png`;

                    const count = filters[trait] || 0;
                    const maxForThisTrait = singleActivationTraits.has(trait) ? 1 : 2;

                    return (
                        <li key={ trait } className="flex flex-col items-center">
                            <div className="relative w-12 h-12 mb-1">
                                <Tooltip text={ trait }>
                                    <Image
                                        src={ imagePath }
                                        alt={ `${ trait } Emblem` }
                                        width={ 48 }
                                        height={ 48 }
                                        className="object-contain"
                                        draggable={ false }
                                        onError={ (e) =>
                                        {
                                            e.currentTarget.style.display = 'none';
                                            console.warn(`Emblem image not found: ${ imagePath }`);
                                        } }
                                    />
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-[1.5px]">
                                <button
                                    onClick={ () => updateFilter(trait, -1) }
                                    disabled={ count === 0 }
                                    aria-label={ `Decrease ${ trait } count, current ${ count }` }
                                    className={ `p-1 bg-zinc-800 border border-zinc-700 rounded disabled:opacity-50 ${
                                        count === 0 ? '' : 'hover:bg-zinc-700 cursor-pointer'
                                    }` }
                                >
                                    <LuMinus className="w-4 h-4 text-zinc-200"/>
                                </button>
                                <span
                                    aria-live="polite"
                                    aria-atomic="true"
                                    className={ `w-6 text-center ${
                                        count > 0 ? 'text-emerald-400' : 'text-white'
                                    }` }
                                >
                                    { count }
                                </span>
                                <button
                                    onClick={ () => updateFilter(trait, 1) }
                                    disabled={ count >= maxForThisTrait || totalBonus >= 4 }
                                    aria-label={ `Increase ${ trait } count, current ${ count }` }
                                    className={ `p-1 bg-zinc-800 border border-zinc-700 rounded disabled:opacity-50 ${
                                        count >= maxForThisTrait || totalBonus >= 4
                                            ? ''
                                            : 'hover:bg-zinc-700 cursor-pointer'
                                    }` }
                                >
                                    <LuPlus className="w-4 h-4 text-zinc-200"/>
                                </button>
                            </div>
                        </li>
                    );
                }) }
            </ul>
        </section>
    );
}