/**
 * IPFS gateway utilities with fallback support
 */

const IPFS_GATEWAYS = [
	'https://dweb.link/ipfs/',
	'https://ipfs.io/ipfs/'
];

/**
 * Extract IPFS CID from various formats
 */
function extractCID(icon: string): string | null {
	if (icon.startsWith('ipfs://')) {
		return icon.replace('ipfs://', '');
	}
	if (icon.startsWith('Qm') || icon.startsWith('bafy')) {
		return icon;
	}
	return null;
}

/**
 * Convert IPFS URL to HTTP gateway URL (uses primary gateway)
 */
export function getIconUrl(icon: string | undefined): string {
	if (!icon) return '';

	const cid = extractCID(icon);
	if (cid) {
		return IPFS_GATEWAYS[0] + cid;
	}

	return icon;
}

/**
 * Get fallback URL for when primary gateway fails
 */
export function getFallbackIconUrl(icon: string | undefined): string | null {
	if (!icon) return null;

	const cid = extractCID(icon);
	if (cid && IPFS_GATEWAYS.length > 1) {
		return IPFS_GATEWAYS[1] + cid;
	}

	return null;
}
