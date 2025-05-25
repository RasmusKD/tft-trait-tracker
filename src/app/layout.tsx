import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { APP_CONFIG, getAppTitle, getAppDescription } from "@/config/app";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: getAppTitle(),
    description: getAppDescription(),
    keywords: [
        "TFT Set 14",
        "TFT Set 10",
        "TFT Remix Rumble",
        "TFT Revival",
        "TFT Set 10 Revival",
        "Remix Rumble Revival",
        `Patch ${APP_CONFIG.patch}`,
        "Trait Tracker augment",
        "Trait Tracker Set 14",
        "Trait Tracker Set 10",
        "Teamfight Tactics Set 14",
        "Teamfight Tactics Remix Rumble",
        "TFT team comps",
        "TFT champion combinations",
        "TFT trait tracker",
        "TFT comp builder",
        "Trait Tracker comp builder",
        "TFT augment optimizer",
        "TFT meta comps",
    ],
    authors: [
        {
            name: APP_CONFIG.author.name,
            url: APP_CONFIG.url,
        },
    ],
    alternates: {
        canonical: APP_CONFIG.url,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: getAppTitle(),
        description: getAppDescription(),
        url: APP_CONFIG.url,
        siteName: APP_CONFIG.name,
        images: [
            {
                url: `${APP_CONFIG.url}/og-image.png`,
                width: 1200,
                height: 630,
                alt: `${APP_CONFIG.name} – TFT Set 14 Augment Optimizer (Patch ${APP_CONFIG.patch})`,
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
        title: APP_CONFIG.name,
    },
    other: {
        "google-adsense-account": APP_CONFIG.ads.googleAdsenseAccount,
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
        <head>
            {process.env.NODE_ENV === 'production' && (
                <Script
                    id="adsense-script"
                    async
                    strategy="afterInteractive"
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${APP_CONFIG.ads.googleAdsenseAccount}`}
                    crossOrigin="anonymous"
                />
            )}
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
        </body>
        </html>
    );
}
