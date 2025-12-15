import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import stats from '$lib/data/stats.json';
import {
	getCacheHeaders,
	generateETag,
	checkETagMatch,
	notModifiedResponse,
	CACHE_PRESETS
} from '$lib/server/cache';

export const GET: RequestHandler = async ({ request }) => {
	// Generate ETag for stats
	const etag = generateETag(stats);

	// Check for conditional request (304 Not Modified)
	if (checkETagMatch(request, etag)) {
		return notModifiedResponse(etag);
	}

	return json(stats, {
		headers: getCacheHeaders({
			...CACHE_PRESETS.stats,
			etag
		})
	});
};
