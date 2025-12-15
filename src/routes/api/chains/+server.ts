import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Placeholder chain data - will be replaced with real data in Issue #2
const PLACEHOLDER_CHAINS = [
	{
		chainId: 1,
		name: 'Ethereum Mainnet',
		shortName: 'eth',
		chain: 'ETH',
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpc: ['https://eth.llamarpc.com'],
		explorers: [{ name: 'Etherscan', url: 'https://etherscan.io', standard: 'EIP3091' }]
	},
	{
		chainId: 56,
		name: 'BNB Smart Chain',
		shortName: 'bnb',
		chain: 'BSC',
		nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
		rpc: ['https://bsc-dataseed.binance.org'],
		explorers: [{ name: 'BscScan', url: 'https://bscscan.com', standard: 'EIP3091' }]
	},
	{
		chainId: 137,
		name: 'Polygon',
		shortName: 'matic',
		chain: 'Polygon',
		nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
		rpc: ['https://polygon-rpc.com'],
		explorers: [{ name: 'PolygonScan', url: 'https://polygonscan.com', standard: 'EIP3091' }]
	},
	{
		chainId: 42161,
		name: 'Arbitrum One',
		shortName: 'arb1',
		chain: 'ETH',
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpc: ['https://arb1.arbitrum.io/rpc'],
		explorers: [{ name: 'Arbiscan', url: 'https://arbiscan.io', standard: 'EIP3091' }]
	},
	{
		chainId: 10,
		name: 'OP Mainnet',
		shortName: 'oeth',
		chain: 'ETH',
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpc: ['https://mainnet.optimism.io'],
		explorers: [{ name: 'Optimism Explorer', url: 'https://optimistic.etherscan.io', standard: 'EIP3091' }]
	},
	{
		chainId: 43114,
		name: 'Avalanche C-Chain',
		shortName: 'avax',
		chain: 'AVAX',
		nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
		rpc: ['https://api.avax.network/ext/bc/C/rpc'],
		explorers: [{ name: 'Snowtrace', url: 'https://snowtrace.io', standard: 'EIP3091' }]
	}
];

export const GET: RequestHandler = async ({ url, platform }) => {
	const search = url.searchParams.get('search')?.toLowerCase();
	const chainId = url.searchParams.get('chainId');

	let chains = PLACEHOLDER_CHAINS;

	// Filter by chainId if provided
	if (chainId) {
		const id = parseInt(chainId, 10);
		chains = chains.filter((c) => c.chainId === id);
	}

	// Filter by search term if provided
	if (search) {
		chains = chains.filter(
			(c) =>
				c.name.toLowerCase().includes(search) ||
				c.shortName.toLowerCase().includes(search) ||
				c.chain.toLowerCase().includes(search) ||
				c.chainId.toString().includes(search)
		);
	}

	// Return with cache headers for edge caching
	return json(chains, {
		headers: {
			'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
};
