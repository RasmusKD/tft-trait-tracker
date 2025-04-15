import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const filterKey = searchParams.get("filterKey") || "none";

    try {
        const client = await clientPromise;
        const db = client.db("TFT");
        const collection = db.collection("SET14");

        const data = await collection.findOne({ filterKey });
        const result = data || (await collection.findOne({ filterKey: "none" })) || { solutions: [] };

        return NextResponse.json({ [filterKey]: result });
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "Failed to load comps data." }, { status: 500 });
    }
}
