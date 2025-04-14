"use client";
import { FaDiscord } from "react-icons/fa";
import React from "react";

export default function Footer() {
    return (
        <footer className="flex items-center justify-center p-4 bg-zinc-800 border-t border-zinc-700">
            <p className="text-sm text-zinc-400 flex items-center gap-1">
                Made with <span className="text-red-500">❤</span> by <FaDiscord className="size-5" /> RasmusKD
            </p>
        </footer>
    );
}
