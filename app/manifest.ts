import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'LocalMD | Premium Markdown Architecture',
        short_name: 'LocalMD',
        description: 'A state-of-the-art, privacy-focused local-first Markdown editor.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f0f1a',
        theme_color: '#8b5cf6',
        icons: [
            {
                src: '/icon.png',
                sizes: '1024x1024',
                type: 'image/png',
            },
        ],
    }

}
