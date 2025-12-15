import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChainMini } from '$lib/types';
import chainsMini from '$lib/data/chains-mini.json';
import {
	getCacheHeaders,
	generateETag,
	checkETagMatch,
	notModifiedResponse,
	CACHE_PRESETS
} from '$lib/server/cache';

const chains = chainsMini as ChainMini[];

export const GET: RequestHandler = async ({ url, request }) => {
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

	const responseData = {
		chains: paginated,
		total,
		limit,
		offset,
		hasMore: offset + limit < total
	};

	// Generate ETag based on response content
	const etag = generateETag(responseData);

	// Check for conditional request (304 Not Modified)
	if (checkETagMatch(request, etag)) {
		return notModifiedResponse(etag);
	}

	return json(responseData, {
		headers: getCacheHeaders({
			...CACHE_PRESETS.chainList,
			etag
		})
	});
};
