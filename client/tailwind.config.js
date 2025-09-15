/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'course-details-heading-small': ['26px', '36px'],
        'course-details-heading-large': ['36px', '44px'],
        'default': ['15px', '21cpx'],
        'home-heading-small': ['24px', '32px'],
        'home-heading-large': ['48px', '56px'],
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
      spacing: {
        'section-height': '500px',
      }
    },
  },
  plugins: [],
}

