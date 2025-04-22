import { championMapping } from "./championMapping";

// Caches for memoization
const tierCache: Record<string, number> = {};
const borderClassCache: Record<string, string> = {};
/**
 * Sort a list of champion names by tier (low→high) and then alphabetically.
 */
export function sortChampionsByTierAndName(champions: string[]): string[] {
    return [...champions].sort((a, b) => {
        const tierA = championMapping[a]?.championTier ?? 99;
        const tierB = championMapping[b]?.championTier ?? 99;
        if (tierA !== tierB) return tierA - tierB;
        return a.localeCompare(b);
    });
}

/**
 * Look up a champion’s TFT tier (1–5).
 */
export function getChampionTier(championName: string): number {
    if (!(championName in tierCache)) {
        tierCache[championName] = championMapping[championName]?.championTier ?? 1;
    }
    return tierCache[championName];
}

/**
 * Choose a CSS border class based on TFT tier, memoized.
 */
export function getChampionBorderClass(championName: string): string {
    if (!(championName in borderClassCache)) {
        let cls: string;
        switch (getChampionTier(championName)) {
            case 1:
                cls = "border-gray-400";
                break;
            case 2:
                cls = "border-green-500";
                break;
            case 3:
                cls = "border-blue-500";
                break;
            case 4:
                cls = "border-purple-500";
                break;
            case 5:
                cls = "border-yellow-500";
                break;
            default:
                cls = "border-gray-400";
        }
        borderClassCache[championName] = cls;
    }
    return borderClassCache[championName];
}

/**
 * Fetch the trait array for a given champion.
 */
export function getChampionTraits(championName: string): string[] {
    return championMapping[championName]?.traits ?? [];
}
