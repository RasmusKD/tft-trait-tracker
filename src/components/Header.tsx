"use client";
import { useState } from "react";
import Image from "next/image";
import { LuInfo } from "react-icons/lu";
import Modal from "./Modal";

interface HeaderProps {
    currentSet: string;
    availableSets: string[];
    onSetChangeAction: (newSet: string) => void;
    showSelectorInHeader: boolean;
}

export default function Header({
                                   currentSet,
                                   availableSets,
                                   onSetChangeAction,
                                   showSelectorInHeader,
                               }: HeaderProps) {
    const [helpOpen, setHelpOpen] = useState(false);

    const SetSwitcher = () => (
        <div className="flex items-center bg-zinc-800/50 border border-zinc-700 rounded-lg p-1">
            {availableSets.map((setId) => {
                const isActive = setId === currentSet;
                const displayName = setId.replace("TFTSet", "Set ");

                return (
                    <button
                        key={setId}
                        onClick={() => onSetChangeAction(setId)}
                        className={`
                            px-4 py-2 rounded-md text-sm font-bold transition-all duration-200
                            ${isActive
                            ? 'bg-indigo-800 text-white shadow-md'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-700/50'
                        }
                        `}
                        aria-pressed={isActive}
                        aria-label={`Switch to ${displayName}`}
                    >
                        {displayName}
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            <header className="bg-zinc-900/75 border-b border-zinc-800 shadow-md sticky top-0 z-40">
                <div className="w-full max-w-screen-2xl mx-auto px-6 py-3">
                    <div className="grid grid-cols-3 items-center">
                        {/* Left section - Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 md:w-16 md:h-16">
                                <Image
                                    src="/logo.png"
                                    alt="Trait Tracker Logo"
                                    fill
                                    sizes="(max-width: 768px) 48px, 64px"
                                    className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] select-none"
                                    draggable={false}
                                    priority
                                />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold italic text-white tracking-tight select-none">
                                Trait Tracker
                            </h1>
                        </div>

                        <div className="flex justify-center">
                            {showSelectorInHeader && (
                                <div className="hidden lg:block">
                                    <SetSwitcher />
                                </div>
                            )}
                        </div>

                        {/* Right section - Info Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setHelpOpen(true)}
                                className="p-2 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded cursor-pointer"
                                type="button"
                                aria-label="How the Tool Works"
                            >
                                <LuInfo className="w-6 h-6" />
                                <span className="sr-only">How the Tool Works</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <Modal
                title="How the Tool Works"
                isOpen={helpOpen}
                onCloseAction={() => setHelpOpen(false)}
            >
                <p>
                    Traittracker.gg helps you easily activate{" "}
                    <strong>8 different traits</strong> in a single round — the
                    requirement to trigger the <strong>Trait Tracker augment</strong> in
                    TFT.
                </p>
                <p className="mt-2">
                    When active, the augment gives you{" "}
                    <strong>6 random emblems</strong>, so it&#39;s a huge power spike. But
                    finding the right trait combination can be tricky — especially
                    during a game.
                </p>
                <p className="mt-2">
                    This tool shows you the <strong>lowest-cost comps</strong> that
                    meet the requirement, using real precomputed data for speed. You
                    can filter by emblems and champions you already have, and the
                    results update instantly.
                </p>
                <p className="mt-2">
                    It&#39;s designed to be fast, simple, and effective — whether you&#39;re
                    playing seriously or just want to cash out your augment.
                </p>
                <p className="pt-4 mt-6 text-xs text-zinc-500 border-t border-zinc-700">
                    Traittracker.gg is a fan-made tool and is not endorsed by Riot
                    Games. All Teamfight Tactics content and assets are © Riot Games.
                </p>
            </Modal>
        </>
    );
}
