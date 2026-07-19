import type { RequestHandler } from './$types';
import { withLocale } from '$lib/i18n';
import { listBlogPosts } from '$lib/server/blog';
import { listPublicLocales } from '$lib/server/publicLocales';

const BASE = 'https://saaskaya.com';
const now = new Date().toISOString();

function pages() {
	const posts = listBlogPosts();
	return [
		{ loc: '/', priority: '1.0', changefreq: 'weekly' },
		{ loc: '/pricing', priority: '0.9', changefreq: 'monthly' },
		{ loc: '/templates', priority: '0.8', changefreq: 'monthly' },
		{ loc: '/about', priority: '0.7', changefreq: 'monthly' },
		{ loc: '/contact', priority: '0.7', changefreq: 'monthly' },
		{ loc: '/blog', priority: '0.7', changefreq: 'weekly' },
		...posts.map((post) => ({
			loc: `/blog/${post.slug}`,
			priority: '0.6',
			changefreq: 'monthly'
		})),
		{ loc: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
		{ loc: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
		{ loc: '/legal/kvkk', priority: '0.3', changefreq: 'yearly' },
		{ loc: '/legal/acceptable-use', priority: '0.3', changefreq: 'yearly' },
		{ loc: '/legal/refund', priority: '0.3', changefreq: 'yearly' },
		{ loc: '/legal/disclaimer', priority: '0.3', changefreq: 'yearly' }
	];
}

function buildSitemap() {
	const localizedPages = pages().flatMap((page) =>
		listPublicLocales().map(({ code }) => ({ ...page, loc: withLocale(code, page.loc) }))
	);
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${localizedPages
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
}

export const GET: RequestHandler = () =>
	new Response(buildSitemap(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
