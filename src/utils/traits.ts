import tftTraits from "../../data/tft_traits.json";

type TFTTraits = {
    units: {
        [champion: string]: {
            traits: string[];
            champion_tier: number;
        };
    };
    trait_thresholds: {
        [trait: string]: number;
    };
};

const traitsData = tftTraits as unknown as TFTTraits;

/**
 * getActivatedTraits
 * Computes the activated traits from selected champions, taking into account both
 * the champions’ inherent traits and bonus values from emblem filters.
 *
 * @param selectedChampions - An array of champion names in the composition.
 * @param filters - An object mapping trait names to bonus counts from emblem filters.
 * @returns A sorted array of trait names that are activated.
 */
export function getActivatedTraits(
    selectedChampions: string[],
    filters: Record<string, number>
): string[] {
    const traitCount: Record<string, number> = {};

    // Count champion-provided traits.
    for (const champion of selectedChampions) {
        const championData = traitsData.units[champion];
        if (championData) {
            championData.traits.forEach((trait) => {
                traitCount[trait] = (traitCount[trait] || 0) + 1;
            });
        }
    }

    // Create a set that includes both champion-provided traits and traits from filters.
    const traitsSet = new Set<string>([
        ...Object.keys(traitCount),
        ...Object.keys(filters)
    ]);

    const activated: string[] = [];
    for (const trait of traitsSet) {
        const championTotal = traitCount[trait] || 0;
        const bonus = filters[trait] || 0;
        const total = championTotal + bonus;
        const threshold = traitsData.trait_thresholds[trait];
        if (threshold && total >= threshold) {
            activated.push(trait);
        }
    }

    return activated.sort();
}
