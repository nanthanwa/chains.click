import type { PageServerLoad } from './$types';
import type { ChainMini, ChainStats } from '$lib/types';
import chainsMini from '$lib/data/chains-mini.json';
import stats from '$lib/data/stats.json';

const chains = chainsMini as ChainMini[];
const chainStats = stats as ChainStats;

// Popular chains to show first (by chainId)
const POPULAR_CHAIN_IDS = [1, 56, 137, 42161, 10, 43114, 8453, 324, 250, 100];

export const load: PageServerLoad = async () => {
	// Get popular chains
	const popularChains = POPULAR_CHAIN_IDS
		.map(id => chains.find(c => c.id === id))
		.filter((c): c is ChainMini => c !== undefined);

	// Get mainnets (excluding popular ones for "other mainnets" section)
	const mainnets = chains
		.filter(c => !c.isTestnet && !POPULAR_CHAIN_IDS.includes(c.id))
		.slice(0, 50);

	return {
		stats: chainStats,
		popularChains,
		mainnets
	};
};
