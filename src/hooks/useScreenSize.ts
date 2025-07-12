import { useState, useEffect } from 'react';

export function useScreenSize(): boolean 
{
    const [ isSmallScreen, setIsSmallScreen ] = useState(false);

    useEffect(() => 
    {
        const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 1024);

        if (typeof window !== 'undefined') 
        {
            checkScreenSize();
            window.addEventListener('resize', checkScreenSize);
            return () => window.removeEventListener('resize', checkScreenSize);
        }
    }, []);

    return isSmallScreen;
}