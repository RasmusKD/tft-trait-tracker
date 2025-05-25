export function getChampionDisplayName(championName: string): string {
    // Handle parenthetical variants
    if (championName.includes('(') && championName.includes(')')) {
        const match = championName.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) {
            const [, baseName, variant] = match;

            // Special cases for common long variants
            const variantMap: Record<string, string> = {
                'True Damage': 'TD',
            };

            const shortVariant = variantMap[variant] || variant;
            return `${baseName} ${shortVariant}`;
        }
    }

    // Fallback: truncate if still too long
    if (championName.length > 12) {
        return championName.substring(0, 10) + '...';
    }

    return championName;
}
