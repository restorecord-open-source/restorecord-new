/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['cdn.restorecord.com', 'restorerecord.com', 'cdn.discordapp.com', 'cdn.discord.com'],
    }
}

module.exports = nextConfig
