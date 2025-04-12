"use client";
import { useState } from "react";
import { ClipboardCopy, Check } from "lucide-react";

export interface CompData {
    selected_champions: string[];
    activated_traits: string[];
    total_cost?: number;
}

export interface CompSectionProps {
    compData: CompData;
}

export default function CompSection({ compData }: CompSectionProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        const text = `Traits: ${compData.activated_traits.join(", ")}\nChampions: ${compData.selected_champions.join(", ")}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 shadow-lg my-6 rounded">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 px-4">
                <h2 className="text-xl text-white">Comp Details</h2>
                <button
                    onClick={copyToClipboard}
                    className="p-2 border rounded border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <ClipboardCopy className="w-4 h-4 text-zinc-200" />
                    )}
                    <span className="sr-only">Copy comp</span>
                </button>
            </div>

            {/* Content: Only Activated Traits and Champions */}
            <div className="px-4 py-4 grid grid-cols-1 gap-6">
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Activated Traits</h3>
                    <div className="flex flex-wrap gap-2">
                        {compData.activated_traits.map((trait, index) => (
                            <span
                                key={index}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-sm"
                            >
                {trait}
              </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Champions</h3>
                    <div className="flex flex-wrap gap-2">
                        {compData.selected_champions.map((champion, index) => (
                            <span
                                key={index}
                                className="border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-sm"
                            >
                {champion}
              </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
