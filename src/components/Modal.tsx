"use client";
import React from "react";
import { LuX } from "react-icons/lu";

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/35 bg-opacity-10 z-50 cursor-pointer"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-xl w-full p-6 relative rounded cursor-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-400 cursor-pointer">
                        <LuX className="w-6 h-6" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}
