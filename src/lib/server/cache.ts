/**
 * Server-side caching utilities for Cloudflare Workers
 */

import { createHash } from 'crypto';

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
	// Client-side cache
	SHORT: 300, // 5 minutes - for frequently changing data
	MEDIUM: 3600, // 1 hour - for chain details
	LONG: 86400, // 24 hours - for static data

	// Edge cache (s-maxage)
	EDGE_SHORT: 3600, // 1 hour
	EDGE_MEDIUM: 86400, // 24 hours
	EDGE_LONG: 604800, // 1 week

	// Stale-while-revalidate
	SWR_SHORT: 86400, // 1 day
	SWR_MEDIUM: 604800, // 1 week
	SWR_LONG: 2592000 // 30 days
} as const;

// KV keys
export const KV_KEYS = {
	CHAINS_MINI: 'chains:mini',
	CHAINS_EIP3085: 'chains:eip3085',
	CHAINS_FULL: 'chains:full',
	STATS: 'chains:stats',
	CHAIN_BY_ID: (id: number | string) => `chain:${id}`,
	LAST_UPDATED: 'meta:lastUpdated'
} as const;

/**
 * Generate cache headers for API responses
 */
export function getCacheHeaders(options: {
	maxAge?: number;
	sMaxAge?: number;
	staleWhileRevalidate?: number;
	isPrivate?: boolean;
	etag?: string;
	lastModified?: string;
}): Record<string, string> {
	const {
		maxAge = CACHE_DURATIONS.SHORT,
		sMaxAge = CACHE_DURATIONS.EDGE_SHORT,
		staleWhileRevalidate = CACHE_DURATIONS.SWR_SHORT,
		isPrivate = false,
		etag,
		lastModified
	} = options;

	const headers: Record<string, string> = {
		'Cache-Control': `${isPrivate ? 'private' : 'public'}, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
		Vary: 'Accept-Encoding'
	};

	if (etag) {
		headers['ETag'] = etag;
	}

	if (lastModified) {
		headers['Last-Modified'] = lastModified;
	}

	return headers;
}

/**
 * Generate ETag from data
 */
export function generateETag(data: unknown): string {
	const content = typeof data === 'string' ? data : JSON.stringify(data);
	const hash = createHash('md5').update(content).digest('hex').slice(0, 16);
	return `"${hash}"`;
}

/**
 * Check if request has matching ETag (for 304 Not Modified)
 */
export function checkETagMatch(request: Request, etag: string): boolean {
	const ifNoneMatch = request.headers.get('If-None-Match');
	if (!ifNoneMatch) return false;

	// Handle multiple ETags (comma-separated)
	const tags = ifNoneMatch.split(',').map((t) => t.trim());
	return tags.includes(etag) || tags.includes('*');
}

/**
 * Create a 304 Not Modified response
 */
export function notModifiedResponse(etag: string): Response {
	return new Response(null, {
		status: 304,
		headers: {
			ETag: etag,
			'Cache-Control': 'public, max-age=300'
		}
	});
}

/**
 * Cache headers presets for different use cases
 */
export const CACHE_PRESETS = {
	// Chain list - frequently accessed, moderate freshness
	chainList: {
		maxAge: CACHE_DURATIONS.SHORT,
		sMaxAge: CACHE_DURATIONS.EDGE_SHORT,
		staleWhileRevalidate: CACHE_DURATIONS.SWR_SHORT
	},

	// Individual chain - less frequently updated
	chainDetail: {
		maxAge: CACHE_DURATIONS.MEDIUM,
		sMaxAge: CACHE_DURATIONS.EDGE_MEDIUM,
		staleWhileRevalidate: CACHE_DURATIONS.SWR_MEDIUM
	},

	// Stats - can be cached longer
	stats: {
		maxAge: CACHE_DURATIONS.SHORT,
		sMaxAge: CACHE_DURATIONS.EDGE_SHORT,
		staleWhileRevalidate: CACHE_DURATIONS.SWR_SHORT
	},

	// Static assets - cache forever (versioned)
	staticAsset: {
		maxAge: CACHE_DURATIONS.LONG,
		sMaxAge: CACHE_DURATIONS.EDGE_LONG,
		staleWhileRevalidate: CACHE_DURATIONS.SWR_LONG
	}
} as const;

/**
 * Type for Cloudflare KV namespace
 */
export interface KVNamespace {
	get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
	put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number; expiration?: number; metadata?: any }): Promise<void>;
	delete(key: string): Promise<void>;
	list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: any }[]; list_complete: boolean; cursor?: string }>;
}

/**
 * Get data from KV with fallback
 */
export async function getFromKV<T>(
	kv: KVNamespace | undefined,
	key: string,
	fallback: () => T
): Promise<T> {
	if (!kv) {
		return fallback();
	}

	try {
		const cached = await kv.get(key, { type: 'json' });
		if (cached) {
			return cached as T;
		}
	} catch (e) {
		console.error(`KV get error for ${key}:`, e);
	}

	return fallback();
}

/**
 * Store data in KV
 */
export async function putToKV(
	kv: KVNamespace | undefined,
	key: string,
	value: unknown,
	ttl?: number
): Promise<void> {
	if (!kv) return;

	try {
		await kv.put(key, JSON.stringify(value), ttl ? { expirationTtl: ttl } : undefined);
	} catch (e) {
		console.error(`KV put error for ${key}:`, e);
	}
}
