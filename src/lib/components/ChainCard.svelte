<script lang="ts">
	import type { ChainMini, ChainEIP3085 } from '$lib/types';
	import { addChain, formatWalletError, getSuccessMessage, hasWallet } from '$lib/wallet';
	import { toast } from '$lib/stores/toast';
	import { getIconUrl, getFallbackIconUrl } from '$lib/utils/ipfs';

	let {
		chain,
		onAdd,
		onSelect
	}: {
		chain: ChainMini;
		onAdd?: (chain: ChainMini) => void;
		onSelect?: (chain: ChainMini) => void;
	} = $props();

	let isAdding = $state(false);
	const walletAvailable = $derived(hasWallet());

	async function handleQuickAdd(e: MouseEvent) {
		e.stopPropagation();

		if (!walletAvailable) {
			// Open modal instead if no wallet
			onSelect?.(chain);
			return;
		}

		if (isAdding) return;

		isAdding = true;
		try {
			// Fetch chain data first
			const res = await fetch(`/api/chains/${chain.id}`);
			if (!res.ok) {
				toast.error('Failed to load chain data');
				return;
			}
			const chainData: ChainEIP3085 = await res.json();

			const result = await addChain(chainData);
			if (result.success) {
				toast.success(getSuccessMessage(result, chain.name));
			} else {
				toast.error(formatWalletError(result));
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to add chain');
		} finally {
			isAdding = false;
		}
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
					onerror={(e) => {
						const img = e.target as HTMLImageElement;
						const fallback = getFallbackIconUrl(chain.icon);
						if (fallback && !img.src.includes('ipfs.io')) {
							img.src = fallback;
						} else {
							img.style.display = 'none';
						}
					}}
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
			onclick={handleQuickAdd}
			disabled={isAdding || chain.rpcCount === 0}
			class="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
			aria-label="Add {chain.name} to wallet"
		>
			{#if isAdding}
				<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
			{:else}
				<span class="hidden sm:inline">Add</span>
				<svg class="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
			{/if}
		</button>
	</div>
</article>
