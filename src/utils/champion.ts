import tftTraits from "../../data/tft_traits.json";

// Define interfaces for champion data.
interface ChampionData {
    traits: string[];
    champion_tier: number;
}

interface TFTTraits {
    units: Record<string, ChampionData>;
    trait_thresholds: Record<string, number>;
}

// Cast the imported JSON.
const traitsData = tftTraits as unknown as TFTTraits;

export function getChampionTier(championName: string): number {
    const championData = traitsData.units[championName];
    return championData ? championData.champion_tier : 1;
}

export function getChampionBorderClass(championName: string): string {
    const tier = getChampionTier(championName);
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

export function getChampionTraits(championName: string): string[] {
    const championData = traitsData.units[championName];
    return championData ? championData.traits : [];
}
