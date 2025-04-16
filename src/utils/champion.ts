import { championMapping } from "@/utils/championMapping";

export function getChampionTier(championName: string): number {
    const championData = championMapping[championName];
    return championData ? championData.championTier : 1;
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
    const championData = championMapping[championName];
    return championData ? championData.traits : [];
}
