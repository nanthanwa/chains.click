import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import stats from '$lib/data/stats.json';

export const GET: RequestHandler = async () => {
	return json(stats, {
		headers: {
			'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
};
