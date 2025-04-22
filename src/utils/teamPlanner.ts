import { championMapping } from "@/utils/championMapping";
import { sortChampionsByTierAndName } from "@/utils/championUtils";

const TARGET_SLOTS = 10;
const CODE_PREFIX = "02";
const SET_IDENTIFIER_PATTERN = /^TFTSet\d+$/;

/**
 * Constructs the TFT Set team code, sorting champions and padding to 10 slots.
 * Throws if setIdentifier doesn't match expected pattern.
 */
export function buildTeamPlannerCode(
    selectedChampions: string[],
    setIdentifier: string
): string {
    if (!SET_IDENTIFIER_PATTERN.test(setIdentifier)) {
        throw new Error(`Invalid setIdentifier: ${setIdentifier}`);
    }

    const sorted = sortChampionsByTierAndName(selectedChampions);
    const padded = sorted.concat(Array(TARGET_SLOTS - sorted.length).fill("Blank"));

    let code = CODE_PREFIX;
    padded.forEach((champ) => {
        const data = championMapping[champ];
        code += data ? data.teamPlannerCode : "000";
    });

    return code + setIdentifier;
}
