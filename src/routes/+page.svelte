<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { ChainMini, ChainEIP3085 } from '$lib/types';
	import { Header, ChainList, ChainModal } from '$lib/components';
	import { theme } from '$lib/stores/theme';
	import { searchQuery, showTestnets, isSearching } from '$lib/stores/search';

	let { data }: { data: PageData } = $props();

	let searchResults = $state<ChainMini[]>([]);
	let selectedChain = $state<ChainMini | null>(null);
	let selectedChainData = $state<ChainEIP3085 | undefined>(undefined);
	let isLoadingChainData = $state(false);

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		theme.init();
	});

	async function handleSearch() {
		const query = $searchQuery.trim();
		if (!query) {
			searchResults = [];
			return;
		}

		$isSearching = true;
		clearTimeout(searchTimeout);

		searchTimeout = setTimeout(async () => {
			try {
				const params = new URLSearchParams({
					q: query,
					limit: '50'
				});
				if (!$showTestnets) {
					params.set('testnet', 'false');
				}
				const res = await fetch(`/api/chains?${params}`);
				const json = await res.json();
				searchResults = json.chains;
			} catch (e) {
				console.error('Search failed:', e);
				searchResults = [];
			} finally {
				$isSearching = false;
			}
		}, 200);
	}

	async function handleSelectChain(chain: ChainMini) {
		selectedChain = chain;
		selectedChainData = undefined;
		isLoadingChainData = true;

		try {
			const res = await fetch(`/api/chains/${chain.id}`);
			if (res.ok) {
				selectedChainData = await res.json();
			}
		} catch (e) {
			console.error('Failed to load chain data:', e);
		} finally {
			isLoadingChainData = false;
		}
	}

	function handleCloseModal() {
		selectedChain = null;
		selectedChainData = undefined;
	}

	// Filter chains based on testnet toggle
	const filteredPopularChains = $derived(
		$showTestnets ? data.popularChains : data.popularChains.filter(c => !c.isTestnet)
	);

	const filteredMainnets = $derived(
		$showTestnets ? data.mainnets : data.mainnets.filter(c => !c.isTestnet)
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>chains.click - Add Blockchain Networks to Your Wallet</title>
	<meta name="title" content="chains.click - Add Blockchain Networks to Your Wallet" />
	<meta name="description" content="One-click add blockchain networks to MetaMask and other Web3 wallets. Support for {data.stats.total}+ EVM chains including Ethereum, Polygon, Arbitrum, and more." />
	<link rel="canonical" href="https://chains.click" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://chains.click" />
	<meta property="og:title" content="chains.click - Add Blockchain Networks to Your Wallet" />
	<meta property="og:description" content="One-click add blockchain networks to MetaMask and other Web3 wallets. Support for {data.stats.total}+ EVM chains." />
	<meta property="og:image" content="https://chains.click/og/home.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://chains.click" />
	<meta property="twitter:title" content="chains.click - Add Blockchain Networks to Your Wallet" />
	<meta property="twitter:description" content="One-click add blockchain networks to MetaMask and other Web3 wallets. Support for {data.stats.total}+ EVM chains." />
	<meta property="twitter:image" content="https://chains.click/og/home.png" />

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "chains.click",
		"description": "Add blockchain networks to MetaMask and other Web3 wallets with one click",
		"url": "https://chains.click",
		"applicationCategory": "Utility",
		"operatingSystem": "Web",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		}
	})}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<Header onSearch={handleSearch} />

	<main class="container mx-auto px-4 py-6 max-w-6xl">
		<!-- Stats -->
		<div class="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
			<div class="text-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
				<div class="text-2xl font-bold text-blue-500">{data.stats.total}</div>
				<div class="text-xs text-slate-500 dark:text-slate-400">Chains</div>
			</div>
			<div class="text-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
				<div class="text-2xl font-bold text-emerald-500">{data.stats.mainnets}</div>
				<div class="text-xs text-slate-500 dark:text-slate-400">Mainnets</div>
			</div>
			<div class="text-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
				<div class="text-2xl font-bold text-amber-500">{data.stats.testnets}</div>
				<div class="text-xs text-slate-500 dark:text-slate-400">Testnets</div>
			</div>
		</div>

		<!-- Search Results -->
		{#if $searchQuery}
			{#if $isSearching}
				<div class="flex items-center justify-center py-12">
					<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{:else}
				<ChainList
					chains={searchResults}
					title="Search Results"
					emptyMessage={`No chains found for "${$searchQuery}"`}
					onSelect={handleSelectChain}
				/>
			{/if}
		{:else}
			<!-- Popular Chains -->
			<ChainList
				chains={filteredPopularChains}
				title="Popular Chains"
				onSelect={handleSelectChain}
			/>

			<!-- All Mainnets -->
			<ChainList
				chains={filteredMainnets}
				title={$showTestnets ? "All Chains" : "Other Mainnets"}
				initialCount={12}
				loadMoreCount={24}
				onSelect={handleSelectChain}
			/>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-8">
		<div class="container mx-auto px-4 py-6 max-w-6xl">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
				<p>
					Data from
					<a href="https://github.com/ethereum-lists/chains" target="_blank" rel="noopener" class="text-blue-500 hover:underline">
						ethereum-lists/chains
					</a>
					· Last updated: {new Date(data.stats.lastUpdated).toLocaleString()}
				</p>
				<div class="flex items-center gap-4">
					<a href="/api/chains" class="hover:text-slate-700 dark:hover:text-slate-300">API</a>
					<a href="https://github.com/nanthanwa/chains.click" target="_blank" rel="noopener" class="hover:text-slate-700 dark:hover:text-slate-300">GitHub</a>
				</div>
			</div>
		</div>
	</footer>
</div>

<!-- Chain Detail Modal -->
{#if selectedChain}
	<ChainModal
		chain={selectedChain}
		chainData={selectedChainData}
		isLoading={isLoadingChainData}
		onClose={handleCloseModal}
	/>
{/if}
