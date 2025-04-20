"use client";
import { useState } from "react";
import Image from "next/image";
import { LuInfo } from "react-icons/lu";
import Modal from "./Modal";

export default function Header() {
    const [helpOpen, setHelpOpen] = useState(false);

    return (
        <>
            <header className="bg-zinc-900 border-b border-zinc-800 shadow-md">
                <div className="w-full max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16">
                            <Image
                                src="/logo.png"
                                alt="Trait Tracker Logo"
                                fill
                                sizes="64px"
                                className="object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] select-none"
                                draggable={false}
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight select-none">
                            Trait Tracker
                        </h1>
                    </div>
                    <button
                        onClick={() => setHelpOpen(true)}
                        className="p-2 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded cursor-pointer"
                    >
                        <LuInfo className="w-6 h-6"/>
                        <span className="sr-only">How the Tool Works</span>
                    </button>
                </div>
            </header>

            <Modal title="How the Tool Works" isOpen={helpOpen} onCloseAction={() => setHelpOpen(false)}>
                <p>
                    Traittracker.gg helps you easily activate <strong>8 different traits</strong> in a single round —
                    the requirement to trigger the <strong>Trait Tracker augment</strong> in TFT.
                </p>
                <p className="mt-2">
                    When active, the augment gives you <strong>6 random emblems</strong>, so it’s a huge power spike.
                    But finding the right trait combination can be tricky — especially during a game.
                </p>
                <p className="mt-2">
                    This tool shows you the <strong>lowest-cost comps</strong> that meet the requirement, using real
                    precomputed data for speed. You can filter by emblems and champions you already have, and the results
                    update instantly.
                </p>
                <p className="mt-2">
                    It’s designed to be fast, simple, and effective — whether you’re playing seriously or just want to
                    cash out your augment.
                </p>
                <p className="pt-4 mt-6 text-xs text-zinc-500 border-t">
                    Traittracker.gg is a fan-made tool and is not endorsed by Riot Games. All Teamfight Tactics content
                    and assets are © Riot Games.
                </p>
            </Modal>
        </>
    );
}
