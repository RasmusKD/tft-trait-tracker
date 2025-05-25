export const APP_CONFIG = {
    version: "1.0",
    patch: "14.4",
    name: "TraitTracker",
    url: "https://traittracker.gg",
    description: "Find optimal champion combinations to activate the Trait Tracker augment in TFT Set 14 and Revival.",
    author: {
        name: "RasmusKD",
        github: "https://github.com/RasmusKD",
        discord: "RasmusKD",
        email: "contact@traittracker.gg",
        kofi: "https://ko-fi.com/rasmuskd"
    },
    ads: {
        googleAdsenseAccount: "ca-pub-7482707847143668"
    }
} as const;

// Helper to generate title with current patch
export function getAppTitle(): string {
    return `Trait Tracker – TFT Set 14 & Set 10 Revival (Patch ${APP_CONFIG.patch})`;
}

// Helper to generate description with current patch
export function getAppDescription(): string {
    return `Discover the easiest champion combinations to activate your Trait Tracker augment in TFT Set 14 and Set 10 Revival (Patch ${APP_CONFIG.patch})`;
}

// Helper to get version string
export function getVersionString(): string {
    return `${APP_CONFIG.name} v${APP_CONFIG.version}`;
}
