/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['cdn.discordapp.com', 'cdn.restorecord.com', 'restorecord.com'],
    },
}

module.exports = nextConfig
