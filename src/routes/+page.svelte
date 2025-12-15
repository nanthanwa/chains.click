<script lang="ts">
	import type { PageData } from './$types';
	import type { ChainMini } from '$lib/types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let searchResults = $state<ChainMini[]>([]);
	let isSearching = $state(false);
	let showTestnets = $state(false);

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;

	async function handleSearch() {
		const query = searchQuery.trim();
		if (!query) {
			searchResults = [];
			return;
		}

		isSearching = true;
		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			try {
				const params = new URLSearchParams({
					q: query,
					limit: '20',
					testnet: showTestnets ? 'true' : 'false'
				});
				const res = await fetch(`/api/chains?${params}`);
				const json = await res.json();
				searchResults = json.chains;
			} catch (e) {
				console.error('Search failed:', e);
			} finally {
				isSearching = false;
			}
		}, 200);
	}

	function getChainIcon(chain: ChainMini): string {
		if (chain.icon?.startsWith('ipfs://')) {
			return chain.icon.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return chain.icon || '';
	}
</script>

<main class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<header class="text-center mb-12">
		<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
			chains.click
		</h1>
		<p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
			Add blockchain networks to your wallet with one click.
			Fast, simple, mobile-friendly.
		</p>
	</header>

	<!-- Search Box -->
	<div class="mb-8">
		<div class="relative max-w-xl mx-auto">
			<input
				type="text"
				bind:value={searchQuery}
				oninput={handleSearch}
				placeholder="Search {data.stats.total} chains by name, ID, or symbol..."
				class="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
			/>
			<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			{#if isSearching}
				<div class="absolute right-4 top-1/2 -translate-y-1/2">
					<div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{/if}
		</div>
		<!-- Testnet toggle -->
		<div class="flex justify-center mt-3">
			<label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={showTestnets}
					onchange={handleSearch}
					class="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
				/>
				Include testnets
			</label>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-blue-500">{data.stats.total}</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Chains</div>
		</div>
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-emerald-500">{data.stats.mainnets}</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Mainnets</div>
		</div>
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-amber-500">{data.stats.testnets}</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Testnets</div>
		</div>
	</div>

	<!-- Search Results -->
	{#if searchQuery && searchResults.length > 0}
		<section class="mb-12">
			<h2 class="text-xl font-semibold mb-4">Search Results</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each searchResults as chain (chain.id)}
					<div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3 min-w-0">
								{#if chain.icon}
									<img src={getChainIcon(chain)} alt="" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
								{:else}
									<div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
								{/if}
								<div class="min-w-0">
									<h3 class="font-medium truncate">{chain.name}</h3>
									<p class="text-sm text-slate-500">
										{chain.symbol} · ID: {chain.id}
										{#if chain.isTestnet}
											<span class="text-amber-500">(Testnet)</span>
										{/if}
									</p>
								</div>
							</div>
							<button
								class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-2"
								onclick={() => alert(`Add ${chain.name} - coming in Issue #5!`)}
							>
								Add
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{:else if searchQuery && !isSearching}
		<div class="text-center py-8 text-slate-500">
			No chains found for "{searchQuery}"
		</div>
	{/if}

	<!-- Popular Chains -->
	{#if !searchQuery}
		<section class="mb-12">
			<h2 class="text-xl font-semibold mb-4">Popular Chains</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.popularChains as chain (chain.id)}
					<div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3 min-w-0">
								{#if chain.icon}
									<img src={getChainIcon(chain)} alt="" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
								{:else}
									<div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
								{/if}
								<div class="min-w-0">
									<h3 class="font-medium truncate">{chain.name}</h3>
									<p class="text-sm text-slate-500">{chain.symbol} · ID: {chain.id}</p>
								</div>
							</div>
							<button
								class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-2"
								onclick={() => alert(`Add ${chain.name} - coming in Issue #5!`)}
							>
								Add
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Other Mainnets -->
		<section class="mb-12">
			<h2 class="text-xl font-semibold mb-4">Other Mainnets</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.mainnets.slice(0, 12) as chain (chain.id)}
					<div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3 min-w-0">
								{#if chain.icon}
									<img src={getChainIcon(chain)} alt="" class="w-8 h-8 rounded-full flex-shrink-0" loading="lazy" />
								{:else}
									<div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
								{/if}
								<div class="min-w-0">
									<h3 class="font-medium truncate">{chain.name}</h3>
									<p class="text-sm text-slate-500">{chain.symbol} · ID: {chain.id}</p>
								</div>
							</div>
							<button
								class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-2"
								onclick={() => alert(`Add ${chain.name} - coming in Issue #5!`)}
							>
								Add
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Footer -->
	<footer class="text-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
		<p class="mb-2">
			Last updated: {new Date(data.stats.lastUpdated).toLocaleDateString()}
		</p>
		<p>
			Data sourced from
			<a href="https://github.com/ethereum-lists/chains" target="_blank" rel="noopener" class="text-blue-500 hover:underline">
				ethereum-lists/chains
			</a>
		</p>
		<p class="mt-2">
			<a href="https://github.com/nanthanwa/chains.click" target="_blank" rel="noopener" class="hover:underline">
				Contribute on GitHub
			</a>
		</p>
	</footer>
</main>
