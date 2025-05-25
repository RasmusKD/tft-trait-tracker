"use client";
import { FaDiscord, FaGithub } from "react-icons/fa";
import React, { useState } from "react";
import { APP_CONFIG, getVersionString } from "@/config/app";

export default function Footer() {
    const [copied, setCopied] = useState(false);

    const copyDiscord = async () => {
        try {
            await navigator.clipboard.writeText(APP_CONFIG.author.discord);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy text:", error);
        }
    };

    return (
        <footer className="flex flex-col gap-1 items-center justify-center p-4 bg-zinc-900/75 border-t border-zinc-800 text-sm text-zinc-400 font-mono">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center relative">
                Made with <span className="text-red-500">❤</span> by
                <a
                    href={APP_CONFIG.author.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center gap-1"
                >
                    <FaGithub className="size-4"/> {APP_CONFIG.author.name}
                </a>
                ·
                <button
                    onClick={copyDiscord}
                    className="hover:text-white flex items-center gap-1 relative group"
                >
                    <FaDiscord className="size-4"/>
                    {APP_CONFIG.author.name}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 bg-opacity-70 text-white text-xs rounded whitespace-nowrap text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        {copied ? "Copied!" : "Copy Discord username"}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-zinc-800"></div>
                    </span>
                </button>
                ·
                <a
                    href={`mailto:${APP_CONFIG.author.email}`}
                    className="hover:text-white underline underline-offset-4"
                >
                    Feedback
                </a>
                ·
                <a
                    href={APP_CONFIG.author.kofi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline underline-offset-4"
                >
                    Support my work on Ko-fi ☕
                </a>
            </div>

            <p className="text-xs text-zinc-500 text-center">
                {getVersionString()}
            </p>
            <p className="text-xs text-zinc-500 text-center">
                {APP_CONFIG.name}.gg is a fan-made tool and is not affiliated with or endorsed by Riot Games. All Teamfight
                Tactics assets and trademarks are © Riot Games.
            </p>
        </footer>
    );
}
