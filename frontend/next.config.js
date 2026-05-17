const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig
