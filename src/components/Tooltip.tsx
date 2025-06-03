'use client';
import React from 'react';

interface TooltipProps {
    /** The content to render inside the tooltip */
    text: React.ReactNode;
    /** The element that triggers the tooltip */
    children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) 
{
    return (
        <div className="relative inline-block group">
            { children }
            <div
                role="tooltip"
                className="
          absolute bottom-full left-1/2
          transform -translate-x-1/2 mb-2
          px-2 py-1
          bg-zinc-800 text-white text-xs
          rounded
          opacity-0 group-hover:opacity-100
          transition-opacity
          whitespace-nowrap
          pointer-events-none z-10
        "
            >
                { text }
                { /* Arrow */ }
                <div
                    className="
            absolute left-1/2 bottom-0
            transform -translate-x-1/2 translate-y-1/2
            w-2 h-2
            bg-zinc-800
            rotate-45
            pointer-events-none
          "
                />
            </div>
        </div>
    );
}
