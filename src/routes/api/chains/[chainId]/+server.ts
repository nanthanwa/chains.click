import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChainEIP3085 } from '$lib/types';
import chainsEIP3085 from '$lib/data/chains-eip3085.json';
import {
	getCacheHeaders,
	generateETag,
	checkETagMatch,
	notModifiedResponse,
	CACHE_PRESETS
} from '$lib/server/cache';

const chains = chainsEIP3085 as Record<string, ChainEIP3085>;

export const GET: RequestHandler = async ({ params, url, request }) => {
	const chainId = parseInt(params.chainId, 10);
	const format = url.searchParams.get('format') || 'eip3085';

	if (isNaN(chainId)) {
		throw error(400, 'Invalid chain ID');
	}

	const chain = chains[chainId.toString()];

	if (!chain) {
		throw error(404, `Chain with ID ${chainId} not found`);
	}

	// Return EIP-3085 format for wallet integration
	if (format === 'eip3085') {
		// Generate ETag for this specific chain
		const etag = generateETag(chain);

		// Check for conditional request (304 Not Modified)
		if (checkETagMatch(request, etag)) {
			return notModifiedResponse(etag);
		}

		return json(chain, {
			headers: getCacheHeaders({
				...CACHE_PRESETS.chainDetail,
				etag
			})
		});
	}

	// Return full chain data if requested
	throw error(400, 'Invalid format. Use format=eip3085');
};
