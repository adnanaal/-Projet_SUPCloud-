/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du logo SUPCloud : bleu ciel (#13A0F8), bleu profond (#0068E0 / #005AD3), bleu nuit (#11274B)
        brand: {
          50: "#EEF7FF",
          100: "#D8EDFE",
          200: "#B6DDFD",
          300: "#7EC6FB",
          400: "#3BAEF9",
          500: "#13A0F8",
          600: "#0068E0",
          700: "#005AD3",
          800: "#004AAD",
          900: "#11274B",
          950: "#0A1730",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "scale-in": {
          from: { opacity: 0, transform: "translateY(8px) scale(0.96)" },
          to: { opacity: 1, transform: "none" },
        },
        "slide-in-right": {
          from: { opacity: 0, transform: "translateX(110%)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "page-in": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "none" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 20px) scale(0.95)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        progress: {
          "0%": { width: "4%" },
          "70%, 100%": { width: "100%" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: 0.7 },
          "100%": { transform: "scale(1.7)", opacity: 0 },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "page-in": "page-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "spin-slow": "spin-slow 12s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        blob: "blob 16s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "gradient-x": "gradient-x 6s ease infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        progress: "progress 3.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
