/**
 * Server-side caching utilities for Cloudflare edge
 */

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
 * Generate ETag from data using a simple hash
 * Works in both Node.js and Cloudflare Workers environments
 */
export function generateETag(data: unknown): string {
	const content = typeof data === 'string' ? data : JSON.stringify(data);
	// Simple hash function for ETag generation
	let hash = 0;
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	// Convert to hex and ensure positive
	const hexHash = (hash >>> 0).toString(16).padStart(8, '0');
	return `"${hexHash}-${content.length.toString(16)}"`;
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
