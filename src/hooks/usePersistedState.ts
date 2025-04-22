import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";

interface InMemoryStore {
    [key: string]: unknown;
}
const memoryStore: InMemoryStore = {};

/**
 * Persists state to localStorage with debounce and fallback.
 */
export default function usePersistedState<T>(
    key: string,
    defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
    // 1) Initialize to default immediately (same on server & client)
    const initial =
        typeof defaultValue === "function"
            ? (defaultValue as () => T)()
            : defaultValue;
    const [state, setState] = useState<T>(initial);

    const timeoutRef = useRef<number | null>(null);

    // 2) On mount, read any saved value and overwrite if present
    useEffect(() => {
        let isMounted = true;
        try {
            const stored = window.localStorage.getItem(key);
            if (stored !== null && isMounted) {
                setState(JSON.parse(stored) as T);
            }
        } catch {
            // ignore
        }
        return () => {
            isMounted = false;
        };
    }, [key]);

    // 3) Whenever state changes, write it back (debounced)
    useEffect(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(state));
            } catch {
                // Fallback to in-memory
                memoryStore[key] = state;
            }
        }, 100);

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, state]);

    return [state, setState];
}