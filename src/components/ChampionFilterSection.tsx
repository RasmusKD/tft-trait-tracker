'use client';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { LuRefreshCw, LuCircleHelp } from 'react-icons/lu';
import { GiTwoCoins } from 'react-icons/gi';
import { getChampionBorderClass } from '@/utils/championUtils';
import { getChampionMappingForSet, ChampionData } from '@/utils/championMapping';
import Tooltip from '../components/Tooltip';
import Modal from '../components/Modal';

export interface ChampionFilterProps {
    setIdentifier: string;
    championFilters: Record<string, boolean>;
    championOverrides: Partial<Record<string, boolean>>;
    setChampionOverridesAction: React.Dispatch<
        React.SetStateAction<Partial<Record<string, boolean>>>
    >;
}

const getDefaultChampionEnabled = (
    championData: ChampionData | undefined
): boolean =>
{
    return championData ? championData.championTier <= 3 : false;
};

export default function ChampionFilterSection({
    setIdentifier,
    championFilters,
    championOverrides,
    setChampionOverridesAction,
}: ChampionFilterProps)
{
    const [ helpOpen, setHelpOpen ] = useState(false);

    const championMappingForSet = useMemo(
        () => getChampionMappingForSet(setIdentifier),
        [ setIdentifier ]
    );

    const setFolder = useMemo(() => setIdentifier.toLowerCase(), [ setIdentifier ]);

    const hasOverrides = useMemo(() => Object.keys(championOverrides).length > 0, [ championOverrides ]);

    const tierMap = useMemo(() =>
    {
        const map: Record<number, string[]> = {};
        Object.entries(championMappingForSet).forEach(([ name, data ]) =>
        {
            const tier = data.championTier;
            if (!map[tier]) map[tier] = [];
            map[tier].push(name);
        });
        Object.values(map).forEach((arr) => arr.sort((a, b) => a.localeCompare(b)));
        return map;
    }, [ championMappingForSet ]);

    const toggleChampion = (champion: string) =>
    {
        const champData = championMappingForSet[champion];
        if (!champData) return;
        const defaultEnabled = getDefaultChampionEnabled(champData);
        const currentOverride = championOverrides[champion];
        const currentEffectiveState =
            currentOverride === undefined ? defaultEnabled : currentOverride;
        const nextEffectiveState = !currentEffectiveState;
        setChampionOverridesAction((prev) =>
        {
            const copy = { ...prev };
            if (nextEffectiveState === defaultEnabled)
            {
                delete copy[champion];
            }
            else
            {
                copy[champion] = nextEffectiveState;
            }
            return copy;
        });
    };

    const toggleTier = (tier: number) =>
    {
        const champsInTier = tierMap[tier] || [];
        if (champsInTier.length === 0) return;
        const allCurrentlyEffectivelyEnabled = champsInTier.every((champName) =>
        {
            const champData = championMappingForSet[champName];
            if (!champData) return false;
            const defaultEnabled = getDefaultChampionEnabled(champData);
            const override = championOverrides[champName];
            return override === undefined ? defaultEnabled : override;
        });
        const nextEffectiveStateForAll = !allCurrentlyEffectivelyEnabled;
        setChampionOverridesAction((prev) =>
        {
            const copy = { ...prev };
            champsInTier.forEach((champName) =>
            {
                const champData = championMappingForSet[champName];
                if (!champData) return;
                const defaultEnabled = getDefaultChampionEnabled(champData);
                if (nextEffectiveStateForAll === defaultEnabled)
                {
                    delete copy[champName];
                }
                else
                {
                    copy[champName] = nextEffectiveStateForAll;
                }
            });
            return copy;
        });
    };

    const resetChampionFilters = () =>
    {
        setChampionOverridesAction({});
    };

    const tiers = [ 1, 2, 3, 4, 5 ] as const;

    return (
        <section
            aria-labelledby="champion-filters-heading"
            className="bg-zinc-900/75 border border-zinc-800 shadow-lg rounded p-4 min-w-0"
        >
            <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-2">
                <h2 id="champion-filters-heading" className="text-xl text-white font-bold">
                    Champion Filters
                </h2>
                <div className="flex gap-2" role="toolbar" aria-label="Champion filter actions">
                    <Tooltip text={ hasOverrides ? 'Reset Champion Filters' : 'No filters to reset' }>
                        <button
                            onClick={ resetChampionFilters }
                            disabled={ !hasOverrides }
                            aria-label="Reset champion filters"
                            className={ `p-2 rounded ${
                                hasOverrides
                                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer'
                                    : 'bg-zinc-800/50 text-zinc-500'
                            }` }
                        >
                            <LuRefreshCw className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Champion Filter Help">
                        <button
                            onClick={ () => setHelpOpen(true) }
                            aria-haspopup="dialog"
                            aria-label="Champion filter help"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                        >
                            <LuCircleHelp className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>
            <Modal
                title="Champion Filter Help"
                isOpen={ helpOpen }
                onCloseAction={ () => setHelpOpen(false) }
            >
                <p>Click on a champion image to toggle it individually. Use the tier toggles to enable/disable whole tiers. By default, 1-3 cost champions are enabled.</p>
            </Modal>
            { tiers.map((tier, idx) =>
            {
                const champsInTier = tierMap[tier] || [];
                if (champsInTier.length === 0) return null;
                const allEffectivelyEnabledInTier = champsInTier.every((c) => championFilters[c]);
                const isLast = idx === tiers.length - 1;

                return (
                    <fieldset key={ tier } className="flex flex-col gap-1 mt-2">

                        <legend className="flex items-center justify-between mb-1 w-full">
                            <div className="flex items-center gap-1">
                                <GiTwoCoins className="w-5 h-5 text-yellow-400" />
                                <span className="text-lg text-white font-semibold">{ tier } cost</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={ allEffectivelyEnabledInTier }
                                    onChange={ () => toggleTier(tier) }
                                    aria-label={ `Toggle all ${ tier }-cost champions` }
                                />
                                <div className="w-10 h-4 bg-zinc-700 rounded-full peer-checked:bg-emerald-400"></div>
                                <div className="absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition-all peer-checked:translate-x-5"></div>
                            </label>
                        </legend>
                        <ul
                            role="list"
                            className={ `flex flex-wrap gap-1 ${ !isLast ? 'border-b border-zinc-800 pb-2 mb-2' : '' }` }
                        >
                            { champsInTier.map((champion) =>
                            {
                                const championImageKey = champion.replace(/[\s.'()/-]/g, '').toLowerCase();
                                const isEffectivelyEnabled = championFilters[champion];

                                return (
                                    <li key={ champion }>
                                        <Tooltip text={ champion }>
                                            <button
                                                onClick={ () => toggleChampion(champion) }
                                                aria-pressed={ isEffectivelyEnabled }
                                                aria-label={ `${ champion } filter ${ isEffectivelyEnabled ? 'on' : 'off' }` }
                                                className={ `w-12 h-12 rounded overflow-hidden border-2 cursor-pointer ${ getChampionBorderClass(setIdentifier, champion) } ${ !isEffectivelyEnabled ? 'grayscale hover:grayscale-[0.3]' : '' } transition` }
                                            >
                                                <Image
                                                    src={ `/champions/${ setFolder }/${ championImageKey }.webp` }
                                                    alt={ champion }
                                                    width={ 48 }
                                                    height={ 48 }
                                                    className="object-cover"
                                                    draggable={ false }
                                                    onError={ (e) => 
                                                    {
                                                        e.currentTarget.style.display = 'none';
                                                        console.warn(
                                                            `Champion image not found for filter: /champions/${ setFolder }/${ championImageKey }.webp (Champion: ${ champion })`
                                                        );
                                                    } }
                                                />
                                            </button>
                                        </Tooltip>
                                    </li>
                                );
                            }) }
                        </ul>
                    </fieldset>
                );
            }) }
        </section>
    );
}