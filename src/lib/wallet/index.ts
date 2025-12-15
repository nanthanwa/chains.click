import type { ChainEIP3085, ChainMini } from '$lib/types';

// Wallet provider types
export type WalletProvider = 'metamask' | 'coinbase' | 'trust' | 'rainbow' | 'rabby' | 'brave' | 'unknown';

// Error codes from EIP-1193
export const WALLET_ERRORS = {
	USER_REJECTED: 4001,
	CHAIN_NOT_ADDED: 4902,
	INVALID_PARAMS: -32602,
	INTERNAL_ERROR: -32603
} as const;

// Mobile deep links
export const MOBILE_DEEP_LINKS: Record<string, string> = {
	metamask: 'https://metamask.app.link/dapp/',
	trust: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
	coinbase: 'https://go.cb-w.com/dapp?cb_url='
};

// Result types
export interface WalletResult {
	success: boolean;
	error?: string;
	errorCode?: number;
	switched?: boolean; // True if chain was switched instead of added
}

/**
 * Check if we're running in a browser with window.ethereum
 */
export function isBrowser(): boolean {
	return typeof window !== 'undefined';
}

/**
 * Check if a wallet is available
 */
export function hasWallet(): boolean {
	return isBrowser() && typeof (window as any).ethereum !== 'undefined';
}

/**
 * Detect the current wallet provider
 */
export function detectWalletProvider(): WalletProvider {
	if (!hasWallet()) return 'unknown';

	const ethereum = (window as any).ethereum;

	if (ethereum.isMetaMask) return 'metamask';
	if (ethereum.isCoinbaseWallet) return 'coinbase';
	if (ethereum.isTrust) return 'trust';
	if (ethereum.isRainbow) return 'rainbow';
	if (ethereum.isRabby) return 'rabby';
	if (ethereum.isBraveWallet) return 'brave';

	return 'unknown';
}

/**
 * Get wallet provider display name
 */
export function getWalletDisplayName(): string {
	const provider = detectWalletProvider();
	const names: Record<WalletProvider, string> = {
		metamask: 'MetaMask',
		coinbase: 'Coinbase Wallet',
		trust: 'Trust Wallet',
		rainbow: 'Rainbow',
		rabby: 'Rabby',
		brave: 'Brave Wallet',
		unknown: 'Wallet'
	};
	return names[provider];
}

/**
 * Check if we're in a mobile browser
 */
export function isMobileBrowser(): boolean {
	if (!isBrowser()) return false;
	return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Check if we're inside a wallet's in-app browser
 */
export function isInWalletBrowser(): boolean {
	if (!isBrowser()) return false;
	const ua = navigator.userAgent.toLowerCase();
	return ua.includes('metamask') || ua.includes('trust') || ua.includes('coinbase');
}

/**
 * Get the mobile deep link for the current page
 */
export function getMobileDeepLink(walletType: 'metamask' | 'trust' | 'coinbase'): string {
	if (!isBrowser()) return '';
	const currentUrl = encodeURIComponent(window.location.href);
	return MOBILE_DEEP_LINKS[walletType] + currentUrl;
}

/**
 * Validate chain data before sending to wallet
 */
export function validateChainData(chainData: ChainEIP3085): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!chainData.chainId || !chainData.chainId.startsWith('0x')) {
		errors.push('Invalid chainId format (must be hex string starting with 0x)');
	}

	if (!chainData.chainName || chainData.chainName.length === 0) {
		errors.push('Chain name is required');
	}

	if (!chainData.nativeCurrency?.symbol) {
		errors.push('Native currency symbol is required');
	}

	if (!chainData.rpcUrls || chainData.rpcUrls.length === 0) {
		errors.push('At least one RPC URL is required');
	}

	// Validate RPC URLs are HTTPS (security requirement)
	const nonHttpsRpcs = chainData.rpcUrls?.filter(
		(url) => !url.startsWith('https://') && !url.startsWith('wss://')
	);
	if (nonHttpsRpcs && nonHttpsRpcs.length > 0) {
		// Filter to only HTTPS URLs, don't error
		chainData.rpcUrls = chainData.rpcUrls.filter(
			(url) => url.startsWith('https://') || url.startsWith('wss://')
		);
		if (chainData.rpcUrls.length === 0) {
			errors.push('No secure (HTTPS) RPC URLs available');
		}
	}

	return { valid: errors.length === 0, errors };
}

/**
 * Try to switch to an existing chain
 */
async function switchChain(chainId: string): Promise<WalletResult> {
	try {
		await (window as any).ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId }]
		});
		return { success: true, switched: true };
	} catch (error: any) {
		if (error.code === WALLET_ERRORS.CHAIN_NOT_ADDED) {
			// Chain doesn't exist, need to add it
			return { success: false, errorCode: WALLET_ERRORS.CHAIN_NOT_ADDED };
		}
		if (error.code === WALLET_ERRORS.USER_REJECTED) {
			return { success: false, error: 'Request rejected by user', errorCode: error.code };
		}
		return { success: false, error: error.message || 'Failed to switch chain', errorCode: error.code };
	}
}

/**
 * Add a chain to the wallet using EIP-3085
 */
export async function addChain(chainData: ChainEIP3085): Promise<WalletResult> {
	if (!hasWallet()) {
		return { success: false, error: 'No wallet detected' };
	}

	// Validate chain data
	const validation = validateChainData(chainData);
	if (!validation.valid) {
		return { success: false, error: validation.errors.join(', ') };
	}

	// First try to switch to the chain (in case it already exists)
	const switchResult = await switchChain(chainData.chainId);
	if (switchResult.success) {
		return switchResult;
	}

	// If chain doesn't exist, add it
	if (switchResult.errorCode === WALLET_ERRORS.CHAIN_NOT_ADDED) {
		try {
			await (window as any).ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: chainData.chainId,
						chainName: chainData.chainName,
						nativeCurrency: chainData.nativeCurrency,
						rpcUrls: chainData.rpcUrls,
						blockExplorerUrls: chainData.blockExplorerUrls || [],
						iconUrls: chainData.iconUrls || []
					}
				]
			});
			return { success: true };
		} catch (error: any) {
			if (error.code === WALLET_ERRORS.USER_REJECTED) {
				return { success: false, error: 'Request rejected by user', errorCode: error.code };
			}
			return { success: false, error: error.message || 'Failed to add chain', errorCode: error.code };
		}
	}

	return switchResult;
}

/**
 * Format error message for display
 */
export function formatWalletError(result: WalletResult): string {
	if (result.success) return '';

	if (result.errorCode === WALLET_ERRORS.USER_REJECTED) {
		return 'You rejected the request in your wallet';
	}

	if (result.errorCode === WALLET_ERRORS.INVALID_PARAMS) {
		return 'Invalid chain parameters';
	}

	return result.error || 'An unexpected error occurred';
}

/**
 * Get a human-readable status for the add chain operation
 */
export function getSuccessMessage(result: WalletResult, chainName: string): string {
	if (!result.success) return '';

	if (result.switched) {
		return `Switched to ${chainName}`;
	}

	return `${chainName} added to your wallet`;
}
