/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                "sm": "640px",
                "md": "768px",
                "lg": "1024px",
                "xl": "1280px",
                
                "sxl": "345px",
                "sx": "425px",
                "smx": "515px",
                "mdx": "640px",
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms')
    ],
}
