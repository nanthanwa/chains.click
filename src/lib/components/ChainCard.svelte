<script lang="ts">
	import type { ChainMini } from '$lib/types';

	let {
		chain,
		onAdd,
		onSelect
	}: {
		chain: ChainMini;
		onAdd?: (chain: ChainMini) => void;
		onSelect?: (chain: ChainMini) => void;
	} = $props();

	function getIconUrl(icon: string | undefined): string {
		if (!icon) return '';
		if (icon.startsWith('ipfs://')) {
			return icon.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return icon;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect?.(chain);
		}
	}
</script>

<article
	class="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
	onclick={() => onSelect?.(chain)}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
>
	<div class="flex items-center gap-3">
		<!-- Icon -->
		<div class="flex-shrink-0">
			{#if chain.icon}
				<img
					src={getIconUrl(chain.icon)}
					alt=""
					class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700"
					loading="lazy"
					onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
				/>
			{:else}
				<div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
					<span class="text-sm font-bold text-slate-500 dark:text-slate-400">
						{chain.symbol.slice(0, 2)}
					</span>
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<h3 class="font-semibold text-slate-900 dark:text-white truncate">
					{chain.name}
				</h3>
				{#if chain.isTestnet}
					<span class="px-1.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
						Testnet
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
				<span class="font-medium">{chain.symbol}</span>
				<span class="text-slate-300 dark:text-slate-600">·</span>
				<span>ID: {chain.id}</span>
				{#if chain.rpcCount > 0}
					<span class="text-slate-300 dark:text-slate-600">·</span>
					<span class="text-emerald-600 dark:text-emerald-400">{chain.rpcCount} RPC{chain.rpcCount > 1 ? 's' : ''}</span>
				{/if}
			</div>
		</div>

		<!-- Add Button -->
		<button
			onclick={(e) => { e.stopPropagation(); onAdd?.(chain); }}
			class="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
			aria-label="Add {chain.name} to wallet"
		>
			<span class="hidden sm:inline">Add</span>
			<svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</article>
