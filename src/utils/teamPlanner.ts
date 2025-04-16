// src/utils/teamPlanner.ts
import { championMapping } from "@/utils/championMapping";

export function buildTeamPlannerCode(selectedChampions: string[], setIdentifier: string): string {
    // For TFT Set14 the code now starts with "02"
    let code = "02";
    const targetSlots = 10;

    // Sort the selected champions by champion cost (championTier) in ascending order;
    // if two champions have the same tier, sort alphabetically.
    const sortedChampions = [...selectedChampions].sort((a, b) => {
        const tierA = championMapping[a] ? championMapping[a].championTier : 99;
        const tierB = championMapping[b] ? championMapping[b].championTier : 99;
        if (tierA !== tierB) return tierA - tierB;
        return a.localeCompare(b);
    });

    // Pad the champions array to ensure there are exactly 10 slots.
    const paddedChampions = [...sortedChampions];
    while (paddedChampions.length < targetSlots) {
        paddedChampions.push("Blank");
    }

    // Build the code by concatenating each champion's three-digit team planner code.
    paddedChampions.forEach(champion => {
        const championData = championMapping[champion] || null;
        // If champion not found, use "000"
        const hex = championData ? championData.teamPlannerCode : "000";
        code += hex;
    });

    // Append the set identifier (e.g., "TFTSet14") at the end.
    code += setIdentifier;
    return code;
}
