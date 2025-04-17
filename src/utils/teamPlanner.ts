import { championMapping } from "@/utils/championMapping";
import { sortChampionsByTierAndName } from "@/utils/championUtils";

/**
 * buildTeamPlannerCode constructs the TFT Set 14 team code,
 * sorting champions via our shared helper and padding to 10 slots.
 */
export function buildTeamPlannerCode(
    selectedChampions: string[],
    setIdentifier: string
): string {
    let code = "02";
    const targetSlots = 10;

    // Sort champions by tier then name
    const sortedChampions = sortChampionsByTierAndName(selectedChampions);

    // Pad to exactly 10 slots
    const paddedChampions = [...sortedChampions];
    while (paddedChampions.length < targetSlots) {
        paddedChampions.push("Blank");
    }

    // Concatenate each champion's code (or "000" if missing)
    paddedChampions.forEach((champion) => {
        const championData = championMapping[champion] || null;
        code += championData ? championData.teamPlannerCode : "000";
    });

    // Append the set identifier (e.g. "TFTSet14")
    code += setIdentifier;
    return code;
}
