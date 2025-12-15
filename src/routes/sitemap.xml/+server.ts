import type { RequestHandler } from './$types';
import type { ChainMini } from '$lib/types';
import chainsMini from '$lib/data/chains-mini.json';

const chains = chainsMini as ChainMini[];

const BASE_URL = 'https://chains.click';

export const GET: RequestHandler = async () => {
	const lastmod = new Date().toISOString().split('T')[0];

	// Start sitemap
	let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

	// Add all chain pages
	for (const chain of chains) {
		// Skip chains without RPC endpoints
		if (chain.rpcCount === 0) continue;

		sitemap += `
  <url>
    <loc>${BASE_URL}/chain/${chain.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${chain.isTestnet ? '0.5' : '0.8'}</priority>
  </url>`;
	}

	sitemap += `
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
