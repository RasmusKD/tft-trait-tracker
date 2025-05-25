import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Set configuration mapping
const SET_CONFIG = {
    "TFTSet14": {
        database: "TFT",
        collection: "SET14"
    },
    "TFTSet10": {
        database: "TFT",
        collection: "SET10"
    }
} as const;

type SupportedSet = keyof typeof SET_CONFIG;
const SUPPORTED_SETS = Object.keys(SET_CONFIG) as SupportedSet[];
const DEFAULT_SET: SupportedSet = "TFTSet14";

function isValidSet(setIdentifier: string): setIdentifier is SupportedSet {
    return SUPPORTED_SETS.includes(setIdentifier as SupportedSet);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const filterKey = searchParams.get("filterKey") || "none";
    const setIdentifier = searchParams.get("setIdentifier") || DEFAULT_SET;

    // Validate set identifier
    if (!isValidSet(setIdentifier)) {
        return NextResponse.json(
            {
                error: `Unsupported set: ${setIdentifier}. Supported sets: ${SUPPORTED_SETS.join(", ")}`
            },
            { status: 400 }
        );
    }

    const config = SET_CONFIG[setIdentifier];

    try {
        const client = await clientPromise;
        const db = client.db(config.database);
        const collection = db.collection(config.collection);

        const data = await collection.findOne({ filterKey });
        const result = data || (await collection.findOne({ filterKey: "none" })) || { solutions: [] };

        return NextResponse.json({ [filterKey]: result });
    } catch (error) {
        console.error(`Error in API route for ${setIdentifier}:`, error);
        return NextResponse.json(
            {
                error: `Failed to load comps data for ${setIdentifier.replace("TFTSet", "Set ")}.`
            },
            { status: 500 }
        );
    }
}
