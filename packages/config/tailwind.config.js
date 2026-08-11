module.exports = {
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          input: 'rgba(255, 255, 255, 0.03)',
        },
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        accent: {
          neon: '#06b6d4',
          violet: '#8b5cf6',
          pink: '#ec4899',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
        'glass-glow': 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.15), transparent 60%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
        'glow-primary': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-accent': '0 0 15px rgba(6, 182, 212, 0.5)',
      }
    }
  },
  plugins: [],
}
