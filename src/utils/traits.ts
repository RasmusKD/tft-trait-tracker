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
 * Computes the activated traits from selected champions, taking into account any bonus values from the filter.
 *
 * @param selectedChampions - An array of champion names in the composition.
 * @param filters - An object mapping trait names to bonus counts from the emblem filters.
 * @returns A sorted array of trait names that are activated.
 */
export function getActivatedTraits(selectedChampions: string[], filters: Record<string, number>): string[] {
    const traitCount: Record<string, number> = {};

    // Count champion traits.
    for (const champion of selectedChampions) {
        const championData = traitsData.units[champion];
        if (championData) {
            championData.traits.forEach((trait) => {
                traitCount[trait] = (traitCount[trait] || 0) + 1;
            });
        }
    }

    const activated: string[] = [];
    // For every trait that appears in the selected champions, add the bonus from filters and check against threshold.
    for (const trait in traitCount) {
        const bonus = filters[trait] || 0;
        const total = traitCount[trait] + bonus;
        const threshold = traitsData.trait_thresholds[trait];
        if (total >= threshold) {
            activated.push(trait);
        }
    }

    return activated.sort();
}
