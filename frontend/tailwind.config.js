module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#002C77', // ANZ inspired
          blue: '#0055A0', // HCLTech inspired
          purple: '#7127FF', // Innovation Nexus accent
          slate: '#F8FAFC',
        },
        primary: '#6610f2', // Bootstrap Indigo
        'primary-bright': '#7e39f4',
        'primary-deep': '#4d0bb8',
        'primary-soft': '#e9dbfd',
        secondary: '#0d6efd', // Bootstrap Blue
        accent: '#6f42c1', // Bootstrap Purple
        canvas: '#ffffff',
        paper: '#ffffff',
        cloud: '#f7f7f7',
        fog: '#e8e8e8',
        steel: '#c2c2c2',
        ink: '#1a1a1a',
        'ink-deep': '#000000',
        'ink-soft': '#292929',
        'on-ink': '#ffffff',
        charcoal: '#3d3d3d',
        graphite: '#636363',
        'bloom-coral': '#ff5050',
        'bloom-rose': '#f9d4d2',
        'bloom-deep': '#b3262b',
        'storm-mist': '#8ebdce',
        'storm-sea': '#7fadbe',
        'storm-deep': '#356373',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        'xxl': '32px',
        'section': '80px',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '3px',
        'md': '4px',
        'lg': '8px',
        'xl': '16px',
      },
      boxShadow: {
        'soft-lift': '0 2px 8px rgba(26, 26, 26, 0.08)',
        'floating': '0 8px 24px rgba(26, 26, 26, 0.12)',
      }
    },
  },
  plugins: [],
}
