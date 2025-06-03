import {
    ChampionData,
    getChampionMappingForSet,
    getTraitThresholdsForSet,
} from './championMapping';

// Cache for reverseTraits: setIdentifier -> championName -> traits[]
const reverseTraitsCache: Record<string, Record<string, string[]>> = {};

function getReverseTraitsForSet(
    setIdentifier: string,
    championMappingForSet: Record<string, ChampionData>
): Record<string, string[]> 
{
    if (reverseTraitsCache[setIdentifier]) 
    {
        return reverseTraitsCache[setIdentifier];
    }
    const newReverseTraits: Record<string, string[]> = {};
    Object.entries(championMappingForSet).forEach(([ champ, data ]) => 
    {
        newReverseTraits[champ] = data.traits;
    });
    reverseTraitsCache[setIdentifier] = newReverseTraits;
    return newReverseTraits;
}

const activatedMemo: Record<string, string[]> = {};

export function getActivatedTraits(
    setIdentifier: string,
    selectedChampions: string[],
    filters: Record<string, number>
): string[] 
{
    const memoKey =
        `${ setIdentifier }|${ selectedChampions.slice().sort().join(',') }|` +
        JSON.stringify(filters);
    if (activatedMemo[memoKey]) return activatedMemo[memoKey];

    // Get data for the current set using helpers
    const championMapping = getChampionMappingForSet(setIdentifier);
    const traitThresholds = getTraitThresholdsForSet(setIdentifier);
    const reverseTraits = getReverseTraitsForSet(
        setIdentifier,
        championMapping
    );

    const traitCount: Record<string, number> = {};
    for (const champ of selectedChampions) 
    {
        (reverseTraits[champ] || []).forEach((trait) => 
        {
            traitCount[trait] = (traitCount[trait] || 0) + 1;
        });
    }

    const activated: string[] = [];
    new Set([ ...Object.keys(traitCount), ...Object.keys(filters) ]).forEach(
        (trait) => 
        {
            const total = (traitCount[trait] || 0) + (filters[trait] || 0);
            const threshold = traitThresholds[trait];
            if (threshold && total >= threshold) activated.push(trait);
        }
    );

    activatedMemo[memoKey] = activated.sort();
    return activatedMemo[memoKey];
}
