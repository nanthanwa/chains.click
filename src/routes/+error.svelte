<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let searchQuery = $state('');
	let isSearching = $state(false);

	onMount(() => {
		theme.init();
	});

	async function handleSearch(e: Event) {
		e.preventDefault();
		if (!searchQuery.trim()) return;

		isSearching = true;
		// Redirect to home with search query
		await goto(`/?q=${encodeURIComponent(searchQuery.trim())}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSearch(e);
		}
	}
</script>

<svelte:head>
	<title>Page Not Found | chains.click</title>
	<meta name="description" content="The page you're looking for doesn't exist. Search for blockchain networks to add to your wallet." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
	<!-- Simple Header -->
	<header class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
		<div class="container mx-auto px-4 py-4 max-w-6xl">
			<a href="/" class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
				<span class="text-2xl">⛓️</span>
				<span>chains.click</span>
			</a>
		</div>
	</header>

	<!-- Error Content -->
	<main class="flex-1 flex items-center justify-center px-4 py-12">
		<div class="text-center max-w-md">
			<!-- Error Icon -->
			<div class="mb-6">
				<div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800">
					<span class="text-5xl">🔍</span>
				</div>
			</div>

			<!-- Error Message -->
			<h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2">
				{$page.status}
			</h1>
			<p class="text-lg text-slate-600 dark:text-slate-400 mb-6">
				{#if $page.status === 404}
					{$page.error?.message || "The page you're looking for doesn't exist."}
				{:else}
					{$page.error?.message || 'Something went wrong.'}
				{/if}
			</p>

			<!-- Search Box -->
			<div class="mb-6">
				<p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
					Search for a blockchain network:
				</p>
				<form onsubmit={handleSearch} class="flex gap-2">
					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={handleKeydown}
						placeholder="e.g., Ethereum, Polygon, 137..."
						class="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						type="submit"
						disabled={isSearching || !searchQuery.trim()}
						class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
					>
						{#if isSearching}
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{:else}
							Search
						{/if}
					</button>
				</form>
			</div>

			<!-- Popular Chains Quick Links -->
			<div class="pt-4 border-t border-slate-200 dark:border-slate-800">
				<p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
					Popular chains:
				</p>
				<div class="flex flex-wrap justify-center gap-2">
					<a href="/chain/1" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
						Ethereum
					</a>
					<a href="/chain/137" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
						Polygon
					</a>
					<a href="/chain/56" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
						BNB Chain
					</a>
					<a href="/chain/42161" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
						Arbitrum
					</a>
					<a href="/chain/10" class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
						Optimism
					</a>
				</div>
			</div>

			<!-- Back Home Link -->
			<div class="mt-8">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to all chains
				</a>
			</div>
		</div>
	</main>
</div>
