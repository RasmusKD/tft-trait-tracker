import { useState, useEffect, Dispatch, SetStateAction } from "react";

/**
 * A React hook that persists state to localStorage.
 * Now reads storage in useEffect so SSR and CSR initial renders match.
 */
export default function usePersistedState<T>(
    key: string,
    defaultValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
    // 1) Initialize to default immediately (same on server & client)
    const [state, setState] = useState<T>(() =>
        typeof defaultValue === "function"
            ? (defaultValue as () => T)()
            : defaultValue
    );

    // 2) On mount, read any saved value and overwrite if present
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(key);
            if (stored !== null) {
                setState(JSON.parse(stored) as T);
            }
        } catch {
            /* ignore */
        }
    }, [key]);

    // 3) Whenever state changes, write it back
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
            /* ignore */
        }
    }, [key, state]);

    return [state, setState];
}
