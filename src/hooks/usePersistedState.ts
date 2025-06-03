import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

interface InMemoryStore {
    [key: string]: unknown;
}
const memoryStore: InMemoryStore = {};

export default function usePersistedState<T>(
    baseKey: string,
    defaultValue: T | (() => T),
    scope?: string,
    getInitializedStatus?: boolean
): [T, Dispatch<SetStateAction<T>>, boolean | undefined] 
{
    const key = scope ? `${ baseKey }-${ scope }` : baseKey;
    const [ initialized, setInitialized ] = useState(false);

    const [ state, setState ] = useState<T>(() => 
    {
        return typeof defaultValue === 'function'
            ? (defaultValue as () => T)()
            : defaultValue;
    });

    const timeoutRef = useRef<number | null>(null);

    // Read from localStorage on mount or when key changes
    useEffect(() => 
    {
        setInitialized(false);
        let isMounted = true;

        if (typeof window !== 'undefined') 
        {
            try 
            {
                const stored = window.localStorage.getItem(key);
                if (stored !== null && isMounted) 
                {
                    setState(JSON.parse(stored) as T);
                }
                else if (isMounted) 
                {
                    setState(typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue);
                }
            }
            catch (error) 
            {
                console.warn(`Error reading localStorage key "${ key }":`, error);
                if (isMounted) 
                {
                    setState(typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue);
                }
            }
            finally 
            {
                if(isMounted) 
                {
                    setInitialized(true);
                }
            }
        }
        else 
        {
            if (isMounted) setInitialized(true);
        }

        return () => 
        {
            isMounted = false;
        };
    }, [ key ]);

    // Write to localStorage when state changes
    useEffect(() => 
    {
        if (!initialized || typeof window === 'undefined') 
        {
            return;
        }

        if (timeoutRef.current !== null) 
        {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => 
        {
            try 
            {
                window.localStorage.setItem(key, JSON.stringify(state));
            }
            catch (error) 
            {
                console.warn(`Error writing to localStorage key "${ key }":`, error);
                memoryStore[key] = state;
            }
        }, 100);

        return () => 
        {
            if (timeoutRef.current !== null) 
            {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [ key, state, initialized ]);

    return [ state, setState, getInitializedStatus ? initialized : undefined ];
}
