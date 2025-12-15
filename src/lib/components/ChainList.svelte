<script lang="ts">
	import type { ChainMini } from '$lib/types';
	import ChainCard from './ChainCard.svelte';

	let {
		chains,
		title,
		emptyMessage = 'No chains found',
		initialCount = 12,
		loadMoreCount = 12,
		onAdd,
		onSelect
	}: {
		chains: ChainMini[];
		title?: string;
		emptyMessage?: string;
		initialCount?: number;
		loadMoreCount?: number;
		onAdd?: (chain: ChainMini) => void;
		onSelect?: (chain: ChainMini) => void;
	} = $props();

	let displayCount = $state(initialCount);

	const displayedChains = $derived(chains.slice(0, displayCount));
	const hasMore = $derived(displayCount < chains.length);
	const remaining = $derived(chains.length - displayCount);

	function loadMore() {
		displayCount = Math.min(displayCount + loadMoreCount, chains.length);
	}

	// Reset display count when chains change
	$effect(() => {
		chains;
		displayCount = initialCount;
	});
</script>

{#if chains.length > 0}
	<section class="mb-8">
		{#if title}
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
				<span class="text-sm text-slate-500 dark:text-slate-400">{chains.length} chains</span>
			</div>
		{/if}

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each displayedChains as chain (chain.id)}
				<ChainCard {chain} {onAdd} {onSelect} />
			{/each}
		</div>

		{#if hasMore}
			<div class="mt-6 text-center">
				<button
					onclick={loadMore}
					class="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors min-h-[48px]"
				>
					Load more ({remaining} remaining)
				</button>
			</div>
		{/if}
	</section>
{:else}
	<div class="text-center py-12 text-slate-500 dark:text-slate-400">
		{emptyMessage}
	</div>
{/if}
