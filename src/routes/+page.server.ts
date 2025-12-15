import type { PageServerLoad } from './$types';
import type { ChainMini, ChainStats } from '$lib/types';
import chainsMini from '$lib/data/chains-mini.json';
import stats from '$lib/data/stats.json';

const chains = chainsMini as ChainMini[];
const chainStats = stats as ChainStats;

// Popular chains to show first (by chainId)
const POPULAR_CHAIN_IDS = [1,56,8453,9745,42161,43114,137,747474,80094,25,534352,10,5000,57073,59144];

export const load: PageServerLoad = async () => {
	// Get popular chains
	const popularChains = POPULAR_CHAIN_IDS
		.map(id => chains.find(c => c.id === id))
		.filter((c): c is ChainMini => c !== undefined);

	// Get all mainnets (excluding popular ones for "other mainnets" section)
	const mainnets = chains
		.filter(c => !c.isTestnet && !POPULAR_CHAIN_IDS.includes(c.id));

	return {
		stats: chainStats,
		popularChains,
		mainnets
	};
};
