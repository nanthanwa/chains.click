import { writable, derived } from 'svelte/store';

export const searchQuery = writable('');
export const showTestnets = writable(false);
export const isSearching = writable(false);

export const filters = derived([showTestnets], ([$showTestnets]) => ({
	testnet: $showTestnets ? undefined : false
}));
