module.exports = {
    // 1. Make sure Tailwind scans your files:
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)' },
                    '50%':     { boxShadow: '0 0 16px rgba(255, 255, 255, 1)' },
                },
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
        },
    },
    // keep any existing plugins or overrides here
};