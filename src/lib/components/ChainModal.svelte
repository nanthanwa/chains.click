<script lang="ts">
	import type { ChainMini, ChainEIP3085 } from '$lib/types';

	let {
		chain,
		chainData,
		isLoading = false,
		onClose,
		onAdd
	}: {
		chain: ChainMini;
		chainData?: ChainEIP3085;
		isLoading?: boolean;
		onClose: () => void;
		onAdd: (chain: ChainMini) => void;
	} = $props();

	function getIconUrl(icon: string | undefined): string {
		if (!icon) return '';
		if (icon.startsWith('ipfs://')) {
			return icon.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return icon;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div
	class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
	onclick={handleBackdropClick}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
>
	<!-- Modal -->
	<div class="bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-fade-in">
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
			<div class="flex items-center gap-3">
				{#if chain.icon}
					<img
						src={getIconUrl(chain.icon)}
						alt=""
						class="w-10 h-10 rounded-full"
						loading="lazy"
					/>
				{:else}
					<div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
						<span class="text-sm font-bold text-slate-500 dark:text-slate-400">
							{chain.symbol.slice(0, 2)}
						</span>
					</div>
				{/if}
				<div>
					<h2 id="modal-title" class="font-semibold text-lg text-slate-900 dark:text-white">
						{chain.name}
					</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						{chain.symbol} · Chain ID: {chain.id}
					</p>
				</div>
			</div>
			<button
				onclick={onClose}
				class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
				aria-label="Close"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4">
			{#if isLoading}
				<div class="flex items-center justify-center py-8">
					<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{:else if chainData}
				<!-- Native Currency -->
				<section>
					<h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Native Currency</h3>
					<div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
						<p class="font-medium text-slate-900 dark:text-white">
							{chainData.nativeCurrency.name} ({chainData.nativeCurrency.symbol})
						</p>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							Decimals: {chainData.nativeCurrency.decimals}
						</p>
					</div>
				</section>

				<!-- RPC URLs -->
				{#if chainData.rpcUrls && chainData.rpcUrls.length > 0}
					<section>
						<h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
							RPC Endpoints ({chainData.rpcUrls.length})
						</h3>
						<div class="space-y-2">
							{#each chainData.rpcUrls as rpc}
								<div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
									<code class="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
										{rpc}
									</code>
									<button
										onclick={() => copyToClipboard(rpc)}
										class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
										aria-label="Copy RPC URL"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
									</button>
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Block Explorers -->
				{#if chainData.blockExplorerUrls && chainData.blockExplorerUrls.length > 0}
					<section>
						<h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Block Explorers</h3>
						<div class="flex flex-wrap gap-2">
							{#each chainData.blockExplorerUrls as explorer}
								<a
									href={explorer}
									target="_blank"
									rel="noopener"
									class="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm text-blue-600 dark:text-blue-400 transition-colors"
								>
									<span class="truncate max-w-[200px]">{new URL(explorer).hostname}</span>
									<svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Chain ID (Hex) -->
				<section>
					<h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Chain ID (Hex)</h3>
					<div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
						<code class="flex-1 text-sm text-slate-700 dark:text-slate-300">
							{chainData.chainId}
						</code>
						<button
							onclick={() => copyToClipboard(chainData.chainId)}
							class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
							aria-label="Copy Chain ID"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						</button>
					</div>
				</section>
			{:else}
				<p class="text-center text-slate-500 dark:text-slate-400 py-8">
					Failed to load chain details
				</p>
			{/if}
		</div>

		<!-- Footer -->
		<div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
			<button
				onclick={() => onAdd(chain)}
				disabled={!chainData || chain.rpcCount === 0}
				class="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[48px]"
			>
				Add to Wallet
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes fade-in {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slide-up 0.2s ease-out;
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}
</style>
