/**
 * IPFS gateway utilities
 */

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Alternative gateways if needed:
// - https://dweb.link/ipfs/
// - https://w3s.link/ipfs/
// - https://nftstorage.link/ipfs/

/**
 * Convert IPFS URL to HTTP gateway URL
 */
export function getIconUrl(icon: string | undefined): string {
	if (!icon) return '';

	if (icon.startsWith('ipfs://')) {
		return icon.replace('ipfs://', IPFS_GATEWAY);
	}

	// Handle raw CID (no protocol)
	if (icon.startsWith('Qm') || icon.startsWith('bafy')) {
		return IPFS_GATEWAY + icon;
	}

	return icon;
}
