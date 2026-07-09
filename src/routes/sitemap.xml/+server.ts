import type { RequestHandler } from './$types';

const BASE = 'https://saaskaya.com';
const now = new Date().toISOString();

const pages = [
	{ loc: '/', priority: '1.0', changefreq: 'weekly' },
	{ loc: '/pricing', priority: '0.9', changefreq: 'monthly' },
	{ loc: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
	{ loc: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
	{ loc: '/legal/kvkk', priority: '0.3', changefreq: 'yearly' },
	{ loc: '/legal/acceptable-use', priority: '0.3', changefreq: 'yearly' },
	{ loc: '/legal/refund', priority: '0.3', changefreq: 'yearly' },
	{ loc: '/legal/disclaimer', priority: '0.3', changefreq: 'yearly' }
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(p) => `  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>
`;

export const GET: RequestHandler = () =>
	new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
