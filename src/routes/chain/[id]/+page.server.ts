import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ChainFull, ChainMini } from '$lib/types';
import chainsFull from '../../../../static/data/chains-full.json';
import chainsMini from '$lib/data/chains-mini.json';

const chainsFullData = chainsFull as Record<string, ChainFull>;
const chainsMiniData = chainsMini as ChainMini[];

export const load: PageServerLoad = async ({ params }) => {
	const chainId = params.id;

	// Try to find by chainId first
	let chain = chainsFullData[chainId];

	// If not found by chainId, try to find by shortName
	if (!chain) {
		const miniChain = chainsMiniData.find(
			(c) => c.name.toLowerCase().replace(/\s+/g, '-') === chainId.toLowerCase()
		);
		if (miniChain) {
			chain = chainsFullData[miniChain.id.toString()];
		}
	}

	if (!chain) {
		throw error(404, {
			message: `Chain "${chainId}" not found`
		});
	}

	// Get mini data for icon URL
	const miniData = chainsMiniData.find((c) => c.id === chain.chainId);

	return {
		chain,
		icon: miniData?.icon
	};
};
