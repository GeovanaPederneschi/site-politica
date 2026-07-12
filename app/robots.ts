import { MetadataRoute } from 'next'

const BASE_URL = 'https://atlantisul.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/painel', '/login', '/cadastro', '/esqueci-senha', '/redefinir-senha'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
