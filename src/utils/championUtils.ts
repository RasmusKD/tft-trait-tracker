import {
    ChampionData,
    getChampionMappingForSet,
} from "./championMapping";

// Cache structure: setIdentifier -> cacheType -> championName -> value
const setCaches: Record<
    string,
    {
        tierCache?: Record<string, number>;
        borderClassCache?: Record<string, string>;
        traitsCache?: Record<string, string[]>;
    }
> = {};

function ensureSetCacheInitialized(
    setIdentifier: string,
    championMappingForSet: Record<string, ChampionData>
) {
    if (!setCaches[setIdentifier]) {
        setCaches[setIdentifier] = {};
    }
    if (!setCaches[setIdentifier].tierCache) {
        const tierCache: Record<string, number> = {};
        const borderClassCache: Record<string, string> = {};
        const traitsCache: Record<string, string[]> = {};

        Object.entries(championMappingForSet).forEach(([name, data]) => {
            tierCache[name] = data.championTier;
            borderClassCache[name] = deriveBorderClass(data.championTier);
            traitsCache[name] = data.traits;
        });
        setCaches[setIdentifier].tierCache = tierCache;
        setCaches[setIdentifier].borderClassCache = borderClassCache;
        setCaches[setIdentifier].traitsCache = traitsCache;
    }
}

function deriveBorderClass(tier: number): string {
    switch (tier) {
        case 1:
            return "border-gray-400";
        case 2:
            return "border-green-500";
        case 3:
            return "border-blue-500";
        case 4:
            return "border-purple-500";
        case 5:
            return "border-yellow-500";
        default:
            return "border-gray-400";
    }
}

export function sortChampionsByTierAndName(
    setIdentifier: string, // Added parameter
    champions: string[]
): string[] {
    const championMapping = getChampionMappingForSet(setIdentifier);
    ensureSetCacheInitialized(setIdentifier, championMapping);
    const tierCache = setCaches[setIdentifier].tierCache!;

    return [...champions].sort((a, b) => {
        const tierA = tierCache[a] ?? 99;
        const tierB = tierCache[b] ?? 99;
        if (tierA !== tierB) return tierA - tierB;
        return a.localeCompare(b);
    });
}

export function getChampionTier(
    setIdentifier: string,
    championName: string
): number {
    const championMapping = getChampionMappingForSet(setIdentifier);
    ensureSetCacheInitialized(setIdentifier, championMapping);
    return setCaches[setIdentifier].tierCache![championName] ?? 1;
}

export function getChampionBorderClass(
    setIdentifier: string,
    championName: string
): string {
    const championMapping = getChampionMappingForSet(setIdentifier);
    ensureSetCacheInitialized(setIdentifier, championMapping);
    return (
        setCaches[setIdentifier].borderClassCache![championName] ||
        "border-gray-400"
    );
}

export function getChampionTraits(
    setIdentifier: string,
    championName: string
): string[] {
    const championMapping = getChampionMappingForSet(setIdentifier);
    ensureSetCacheInitialized(setIdentifier, championMapping);
    // Fallback to championMapping[championName] if cache isn't populated for some reason,
    // or directly use the cache.
    return (
        setCaches[setIdentifier].traitsCache![championName] ??
        championMapping[championName]?.traits ??
        []
    );
}
