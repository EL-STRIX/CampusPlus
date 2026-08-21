/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004349',
          container: '#0d5c63',
          fixed: '#abeef6',
        },
        secondary: {
          DEFAULT: '#545f73',
          container: '#d5e0f8',
        },
        surface: {
          DEFAULT: '#f8fafa',
          container: '#eceeee',
          low: '#f2f4f4',
          lowest: '#ffffff',
        },
        status: {
          open: '#64748B',
          inProgress: '#F59E0B',
          resolved: '#10B981',
          rejected: '#EF4444',
          needsReview: '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
};
