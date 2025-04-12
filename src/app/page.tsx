"use client";
import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import FilterSection from "../components/FilterSection";
import CompSection from "../components/CompSection";
import Footer from "../components/Footer";

// Define a type for a single comp solution.
interface CompData {
  selected_champions: string[];
  activated_traits: string[];
  total_cost?: number;
}

// Type for the precomputed comps object.
interface PrecomputedComps {
  [key: string]: {
    min_champion_count: number;
    solutions: CompData[];
  };
}

/**
 * Helper function to convert the filters object into a lookup key.
 * Returns "none" if no bonus is applied; otherwise,
 * returns a comma-separated string of "Trait:Value" pairs in sorted order.
 */
function bonusDictToKey(filters: Record<string, number>): string {
  const items = Object.entries(filters)
      .filter(([, v]) => v > 0)
      .sort(([a], [b]) => a.localeCompare(b));
  if (items.length === 0) return "none";
  return items.map(([k, v]) => `${k}:${v}`).join(",");
}

export default function Home() {
  const [filters, setFilters] = useState<Record<string, number>>({});
  const [comps, setComps] = useState<PrecomputedComps>({});
  const [loading, setLoading] = useState(true);

  // Compute the lookup key from the filters.
  const lookupKey = useMemo(() => bonusDictToKey(filters), [filters]);
  console.log("Computed Lookup Key:", lookupKey);

  // Single useEffect to fetch comps whenever the lookupKey changes.
  useEffect(() => {
    async function fetchFilteredComps() {
      setLoading(true);
      try {
        console.log("Fetching comps for lookupKey:", lookupKey);
        const res = await fetch(`/api/comps?filterKey=${encodeURIComponent(lookupKey)}`);
        if (!res.ok) throw new Error("Failed to fetch comps");
        const data = (await res.json()) as PrecomputedComps;
        console.log("Fetched filtered comps keys:", Object.keys(data));
        setComps(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredComps();
  }, [lookupKey]);

  // Determine if no filters are applied.
  const totalBonus = Object.values(filters).reduce((acc, val) => acc + val, 0);
  const noFilter = totalBonus === 0;
  // If no filters and "none" exists, use it; otherwise, use the full comps object.
  const compsToRender: PrecomputedComps =
      noFilter && comps["none"] ? { none: comps["none"] } : comps;

  // Flatten all solutions from compsToRender into one array.
  const allSolutions: CompData[] = Object.entries(compsToRender).reduce(
      (acc, [, compInfo]) => acc.concat(compInfo.solutions ?? []),
      [] as CompData[]
  );

  console.log("Number of solutions to render:", allSolutions.length);

  return (
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <FilterSection filters={filters} setFiltersAction={setFilters} />
          {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-500"></div>
              </div>
          ) : (
              <div className="space-y-6">
                {allSolutions.length > 0 ? (
                    allSolutions.map((solution, idx) => (
                        <CompSection key={idx} compData={solution} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-zinc-400">
                        No compositions found. Try adjusting your filters.
                      </p>
                    </div>
                )}
              </div>
          )}
        </main>
        <Footer />
      </div>
  );
}
