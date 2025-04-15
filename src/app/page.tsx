"use client";
import { useEffect, useState, useMemo } from "react";
import Header from "../components/Header";
import FilterSection from "../components/FilterSection";
import ChampionFilterSection from "../components/ChampionFilterSection";
import CompSection from "../components/CompSection";
import Footer from "../components/Footer";

// Define a type for a single comp solution.
interface CompData {
  selected_champions: string[];
}

// Define a type for the precomputed comps object.
interface PrecomputedComps {
  [key: string]: {
    solutions: CompData[];
  };
}

/**
 * Helper function to convert the filters object into a lookup key.
 * Returns "none" if no bonus is applied; otherwise, returns a comma-separated
 * string of "Trait:Value" pairs in sorted order.
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
  const [hideTraits, setHideTraits] = useState<boolean>(false);
  const [championFilters, setChampionFiltersAction] = useState<Record<string, boolean>>({});

  const lookupKey = useMemo(() => bonusDictToKey(filters), [filters]);

  // Load stored values from localStorage on mount.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHideTraits = localStorage.getItem("hideTraits");
      if (storedHideTraits !== null) {
        setHideTraits(JSON.parse(storedHideTraits));
      }
      const storedChampionFilters = localStorage.getItem("championFilters");
      if (storedChampionFilters !== null) {
        setChampionFiltersAction(JSON.parse(storedChampionFilters));
      }
    }
  }, []);


  // Persist hideTraits and championFilters changes.
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hideTraits", JSON.stringify(hideTraits));
    }
  }, [hideTraits]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("championFilters", JSON.stringify(championFilters));
    }
  }, [championFilters]);

  // Fetch comps whenever lookupKey changes.
  useEffect(() => {
    setLoading(true);

    fetch(`/api/comps?filterKey=${encodeURIComponent(lookupKey)}`)
        .then(res => {
          if (!res.ok) {
            console.error("Failed to fetch comps");
            return null;
          }
          console.time("API Fetch");
          return res.json();
        })
        .then(data => {
          if (data) {
            console.timeEnd("API Fetch");
            setComps(data);
          }
        })
        .catch(error => {
          console.error("Unexpected fetch error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
  }, [lookupKey]);



  const totalBonus = Object.values(filters).reduce((acc, val) => acc + val, 0);
  const noFilter = totalBonus === 0;
  const compsToRender: PrecomputedComps =
      noFilter && comps["none"] ? { none: comps["none"] } : comps;

  const allSolutions = Object.entries(compsToRender).reduce(
      (acc, [, compInfo]) => acc.concat(compInfo.solutions ?? []),
      [] as CompData[]
  );
  // Filter comps based on championFilters.
  const filteredSolutions = allSolutions.filter((solution: CompData) =>
      solution.selected_champions.every(champ => championFilters[champ])
  );

  useEffect(() => {
    console.log("Computed Lookup Key:", lookupKey);
  }, [lookupKey]);

  useEffect(() => {
    console.log("Number of solutions to render:", filteredSolutions.length);
  }, [filteredSolutions]);

  return (
      <div className="min-h-screen flex flex-col bg-zinc-950 font-[family-name:var(--font-geist-sans)]">
        <Header/>
        <main className="flex-grow container mx-auto px-3 py-8">
          <FilterSection
              filters={filters}
              setFiltersAction={setFilters}
              hideTraits={hideTraits}
              setHideTraits={setHideTraits}
          />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full size-12 border-t-2 border-b-2 border-zinc-500"></div>
                  </div>
              ) : (
                  <div className="flex flex-col gap-6">
                    {filteredSolutions.length > 0 ? (
                        filteredSolutions.map((solution, idx) => (
                            <CompSection key={idx} compData={solution} hideTraits={hideTraits} filters={filters} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
                          <p className="text-zinc-400">No compositions found. Try adjusting your filters.</p>
                        </div>
                    )}
                  </div>
              )}
            </div>
            <div className="w-md">
              <ChampionFilterSection championFilters={championFilters} setChampionFiltersAction={setChampionFiltersAction}/>
            </div>
          </div>
        </main>
        <Footer/>
      </div>
  );
}
