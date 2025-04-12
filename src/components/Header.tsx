"use client";
import { useState } from "react";
import Image from "next/image";
import { Info, X } from "lucide-react";

export default function Header() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16">
                        <Image
                            src="/logo.png"
                            alt="Trait Tracker Logo"
                            fill
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
                    onClick={() => setShowModal(true)}
                    className="p-2 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded"
                >
                    <Info className="w-6 h-6" />
                    <span className="sr-only">About</span>
                </button>
            </header>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-md w-full p-6 relative rounded">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-white hover:text-gray-400"
                        >
                            <X className="w-6 h-6" />
                            <span className="sr-only">Close</span>
                        </button>
                        <h2 className="text-xl font-bold mb-2">About Trait Tracker</h2>
                        <p className="text-zinc-300">
                            Trait Tracker helps you rapidly lookup and optimize team compositions for Teamfight Tactics using precomputed data.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
