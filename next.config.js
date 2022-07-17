/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [ 'cdn.restorecord.com', 'restorerecord.com',  'cdn.discordapp.com', 'cdn.discord.com', 'i.imgur.com' ],
    }
}

module.exports = nextConfig
