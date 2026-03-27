import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Local Markdown Viewer',
        short_name: 'MD Viewer',
        description: 'Offline-first Markdown viewer and editor',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.png',
                sizes: '1024x1024',
                type: 'image/png',
            },
        ],
    }
}
