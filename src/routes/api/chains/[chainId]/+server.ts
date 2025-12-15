import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Placeholder - will be replaced with data from Issue #2
const CHAINS_BY_ID: Record<number, object> = {
	1: {
		chainId: 1,
		name: 'Ethereum Mainnet',
		shortName: 'eth',
		chain: 'ETH',
		nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
		rpc: [
			'https://eth.llamarpc.com',
			'https://rpc.ankr.com/eth',
			'https://eth-mainnet.public.blastapi.io'
		],
		explorers: [
			{ name: 'Etherscan', url: 'https://etherscan.io', standard: 'EIP3091' }
		],
		infoURL: 'https://ethereum.org'
	},
	56: {
		chainId: 56,
		name: 'BNB Smart Chain',
		shortName: 'bnb',
		chain: 'BSC',
		nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
		rpc: [
			'https://bsc-dataseed.binance.org',
			'https://bsc-dataseed1.defibit.io'
		],
		explorers: [
			{ name: 'BscScan', url: 'https://bscscan.com', standard: 'EIP3091' }
		],
		infoURL: 'https://www.bnbchain.org'
	},
	137: {
		chainId: 137,
		name: 'Polygon',
		shortName: 'matic',
		chain: 'Polygon',
		nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
		rpc: [
			'https://polygon-rpc.com',
			'https://rpc-mainnet.maticvigil.com'
		],
		explorers: [
			{ name: 'PolygonScan', url: 'https://polygonscan.com', standard: 'EIP3091' }
		],
		infoURL: 'https://polygon.technology'
	}
};

export const GET: RequestHandler = async ({ params }) => {
	const chainId = parseInt(params.chainId, 10);

	if (isNaN(chainId)) {
		throw error(400, 'Invalid chain ID');
	}

	const chain = CHAINS_BY_ID[chainId];

	if (!chain) {
		throw error(404, `Chain with ID ${chainId} not found`);
	}

	return json(chain, {
		headers: {
			'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
		}
	});
};
