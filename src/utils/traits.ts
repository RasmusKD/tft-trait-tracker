import { championMapping, traitThresholds } from "@/utils/championMapping";

// Reverse map champion → traits precomputed
const reverseTraits: Record<string, string[]> = {};
Object.entries(championMapping).forEach(([champ, data]) => {
    reverseTraits[champ] = data.traits;
});

const activatedMemo: Record<string, string[]> = {};

/**
 * Computes activated traits given selected champions and filters, memoized.
 */
export function getActivatedTraits(
    selectedChampions: string[],
    filters: Record<string, number>
): string[] {
    const key = selectedChampions.slice().sort().join(",") + "|" + JSON.stringify(filters);
    if (activatedMemo[key]) return activatedMemo[key];

    // Count champion-provided traits
    const traitCount: Record<string, number> = {};
    for (const champ of selectedChampions) {
        (reverseTraits[champ] || []).forEach((trait) => {
            traitCount[trait] = (traitCount[trait] || 0) + 1;
        });
    }

    // Combine champion counts with filter bonuses
    const activated: string[] = [];
    new Set([...Object.keys(traitCount), ...Object.keys(filters)]).forEach((trait) => {
        const total = (traitCount[trait] || 0) + (filters[trait] || 0);
        const threshold = traitThresholds[trait];
        if (threshold && total >= threshold) activated.push(trait);
    });

    activatedMemo[key] = activated.sort();
    return activatedMemo[key];
}
