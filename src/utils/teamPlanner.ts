import {
    getChampionMappingForSet,
    getSetConfig,
} from "./championMapping";
import { sortChampionsByTierAndName } from "./championUtils";

const SET_IDENTIFIER_PATTERN = /^TFTSet\d+$/;

/**
 * Constructs the TFT Set team code, sorting champions and padding to 10 slots.
 * Throws if setIdentifier doesn't match expected pattern.
 */
export function buildTeamPlannerCode(
    setIdentifier: string,
    selectedChampions: string[]
): string {
    if (!SET_IDENTIFIER_PATTERN.test(setIdentifier)) {
        throw new Error(`Invalid setIdentifier: ${setIdentifier}`);
    }
    // Get Config and data for set
    const championMapping = getChampionMappingForSet(setIdentifier);
    const config = getSetConfig(setIdentifier);

    if (!config) {
        throw new Error(`No configuration found for set: ${setIdentifier}`);
    }

    const { teamPlannerCodePrefix, targetSlots } = config;

    // Pass setIdentifier to sort function
    const sorted = sortChampionsByTierAndName(setIdentifier, selectedChampions);
    const padded = sorted.concat(
        Array(Math.max(0, targetSlots - sorted.length)).fill("Blank")
    );

    let code = teamPlannerCodePrefix;
    padded.forEach((champ) => {
        const data = championMapping[champ];
        code += data ? data.teamPlannerCode : "000";
    });

    return code + setIdentifier;
}
