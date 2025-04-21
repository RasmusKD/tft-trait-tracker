// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Trait Tracker – TFT Set 14 Augment Optimizer (Patch 14.2)",
    description:
        "Find optimal champion combinations to activate the Trait Tracker augment in TFT Set 14 (Patch 14.2). Get instant results and dominate your game!",
    keywords: [
        "TFT Set 14",
        "Patch 14.2",
        "Trait Tracker augment",
        "Trait Tracker Set 14",
        "Teamfight Tactics Set 14",
        "TFT team comps",
        "TFT augment optimizer",
        "TFT champion combinations",
        "Trait Tracker comp builder",
    ],
    authors: [
        {
            name: "RasmusKD",
            url: "https://traittracker.gg",
        },
    ],
    alternates: {
        canonical: "https://traittracker.gg",
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: "Trait Tracker – TFT Set 14 Augment Optimizer (Patch 14.2)",
        description:
            "Quickly discover the easiest champion combinations to activate your Trait Tracker augment in TFT Set 14 (Patch 14.2).",
        url: "https://traittracker.gg",
        siteName: "Trait Tracker",
        images: [
            {
                url: "https://traittracker.gg/og-image.png",
                width: 1200,
                height: 630,
                alt: "Trait Tracker – TFT Set 14 Augment Optimizer (Patch 14.2)",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    icons: {
        icon: [
            { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
            { url: "/favicon.svg", type: "image/svg+xml" }
        ],
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    appleWebApp: {
        title: "TraitTracker",
    },
    other: {
        "google-adsense-account": "ca-pub-7482707847143668",
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        </body>
        </html>
    );
}
