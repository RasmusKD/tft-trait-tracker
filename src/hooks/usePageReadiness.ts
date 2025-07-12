import { useState, useEffect } from 'react';

interface UsePageReadinessProps {
    currentSetIdentifier: string;
    hideTraitsInitialized: boolean | undefined;
    compactViewInitialized: boolean | undefined;
    championOverridesInitialized: boolean | undefined;
    availableSets: string[];
    onSetChange: (set: string) => void;
}

export function usePageReadiness({
    currentSetIdentifier,
    hideTraitsInitialized,
    compactViewInitialized,
    championOverridesInitialized,
    availableSets,
    onSetChange
}: UsePageReadinessProps)
{
    const [ isSetIdentifierHydrated, setIsSetIdentifierHydrated ] = useState(false);
    const [ isPageReady, setIsPageReady ] = useState(false);

    useEffect(() =>
    {
        let effectiveSet = currentSetIdentifier;
        if (!availableSets.includes(currentSetIdentifier))
        {
            effectiveSet = availableSets[0];
            onSetChange(effectiveSet);
        }
        setIsSetIdentifierHydrated(true);
    }, [ currentSetIdentifier, availableSets, onSetChange ]);

    useEffect(() =>
    {
        if (
            isSetIdentifierHydrated &&
            hideTraitsInitialized === true &&
            compactViewInitialized === true &&
            championOverridesInitialized === true
        )
        {
            setIsPageReady(true);
        }
        else
        {
            setIsPageReady(false);
        }
    }, [
        isSetIdentifierHydrated,
        hideTraitsInitialized,
        compactViewInitialized,
        championOverridesInitialized,
    ]);

    return isPageReady;
}