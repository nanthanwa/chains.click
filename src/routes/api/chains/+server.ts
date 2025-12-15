import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChainMini } from '$lib/types';
import chainsMini from '$lib/data/chains-mini.json';

const chains = chainsMini as ChainMini[];

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('q')?.toLowerCase();
	const testnet = url.searchParams.get('testnet');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);

	let filtered = chains;

	// Filter by testnet/mainnet
	if (testnet === 'true') {
		filtered = filtered.filter((c) => c.isTestnet);
	} else if (testnet === 'false') {
		filtered = filtered.filter((c) => !c.isTestnet);
	}

	// Filter by search term
	if (search) {
		filtered = filtered.filter(
			(c) =>
				c.name.toLowerCase().includes(search) ||
				c.symbol.toLowerCase().includes(search) ||
				c.chain.toLowerCase().includes(search) ||
				c.id.toString() === search
		);
	}

	// Pagination
	const total = filtered.length;
	const paginated = filtered.slice(offset, offset + limit);

	return json(
		{
			chains: paginated,
			total,
			limit,
			offset,
			hasMore: offset + limit < total
		},
		{
			headers: {
				'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
			}
		}
	);
};
