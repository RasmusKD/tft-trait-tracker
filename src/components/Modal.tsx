"use client";
import React from "react";
import { LuX } from "react-icons/lu";

interface ModalProps {
    title: string;
    isOpen: boolean;
    onCloseAction: () => void;
    children: React.ReactNode;
}

export default function Modal({ title, isOpen, onCloseAction, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 flex items-center justify-center bg-black/35 bg-opacity-10 z-50"
            onClick={onCloseAction}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-xl w-full p-6 relative rounded cursor-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 id="modal-title" className="text-xl font-bold">
                        {title}
                    </h2>
                    <button
                        onClick={onCloseAction}
                        className="text-white hover:text-gray-400 cursor-pointer"
                        type="button"
                        aria-label="Close modal"
                    >
                        <LuX className="w-6 h-6" />
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}
