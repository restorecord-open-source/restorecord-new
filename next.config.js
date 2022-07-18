/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [ 'cdn.restorecord.com', 'restorerecord.com',  'cdn.discordapp.com', 'cdn.discord.com', 'i.imgur.com' ],
    },
    experimental: {
        images: {
            allowFutureImage: true,
        }
    }
}

module.exports = nextConfig
