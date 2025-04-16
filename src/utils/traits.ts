import { championMapping, traitThresholds } from "@/utils/championMapping";

/**
 * getActivatedTraits computes the activated traits given a set of selected champions
 * and any bonus amounts (filters) applied.
 *
 * @param selectedChampions - An array of champion names.
 * @param filters - An object mapping trait names to bonus counts.
 * @returns A sorted array of trait names that are activated.
 */
export function getActivatedTraits(
    selectedChampions: string[],
    filters: Record<string, number>
): string[] {
    const traitCount: Record<string, number> = {};

    // Count champion-provided traits based on championMapping.
    for (const champion of selectedChampions) {
        const championData = championMapping[champion];
        if (championData) {
            championData.traits.forEach((trait) => {
                traitCount[trait] = (traitCount[trait] || 0) + 1;
            });
        }
    }

    // Include both the traits that come from champions and the ones specified in filters.
    const traitsSet = new Set<string>([
        ...Object.keys(traitCount),
        ...Object.keys(filters),
    ]);

    const activated: string[] = [];
    for (const trait of traitsSet) {
        const championTotal = traitCount[trait] || 0;
        const bonus = filters[trait] || 0;
        const total = championTotal + bonus;
        const threshold = traitThresholds[trait];
        if (threshold && total >= threshold) {
            activated.push(trait);
        }
    }

    return activated.sort();
}
