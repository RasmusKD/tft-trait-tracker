import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

interface CompData {
    selected_champions: string[];
    activated_traits: string[];
    total_cost?: number;
}

interface PrecomputedComps {
    [key: string]: {
        min_champion_count: number;
        solutions: CompData[];
    };
}

// Global cache variable for precomputed data.
let cachedData: PrecomputedComps | null = null;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filterKey = searchParams.get("filterKey") || "none";
        console.log("API Lookup Key:", filterKey);

        if (!cachedData) {
            const filePath = path.join(process.cwd(), "data", "precomputed_comps.json");
            const fileContents = await fs.readFile(filePath, "utf8");
            cachedData = JSON.parse(fileContents) as PrecomputedComps;
            console.log("Loaded cachedData keys:", Object.keys(cachedData));
        }
        const result =
            cachedData[filterKey] || cachedData["none"] || { min_champion_count: 0, solutions: [] };
        console.log("Returning API result with keys:", Object.keys(result));
        // Wrap the result in an object keyed by filterKey.
        return NextResponse.json({ [filterKey]: result });
    } catch (error) {
        console.error("Error in API lookup:", error);
        return NextResponse.json({ error: "Failed to load comps data." }, { status: 500 });
    }
}
