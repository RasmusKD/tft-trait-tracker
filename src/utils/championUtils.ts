import { championMapping } from "./championMapping";

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
    return championMapping[championName]?.championTier ?? 1;
}

/**
 * Choose a CSS border class based on TFT tier.
 */
export function getChampionBorderClass(championName: string): string {
    switch (getChampionTier(championName)) {
        case 1: return "border-gray-400";
        case 2: return "border-green-500";
        case 3: return "border-blue-500";
        case 4: return "border-purple-500";
        case 5: return "border-yellow-500";
        default: return "border-gray-400";
    }
}

/**
 * Fetch the trait array for a given champion.
 */
export function getChampionTraits(championName: string): string[] {
    return championMapping[championName]?.traits ?? [];
}
