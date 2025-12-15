<script lang="ts">
	// Placeholder for chain data - will be loaded in Issue #2
	const stats = {
		chains: 800,
		mainnets: 150,
		testnets: 650
	};
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

	<!-- Search Box (placeholder) -->
	<div class="mb-8">
		<div class="relative max-w-xl mx-auto">
			<input
				type="text"
				placeholder="Search by chain name, ID, or symbol..."
				class="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
			/>
			<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-3 gap-4 mb-12 max-w-lg mx-auto">
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-blue-500">{stats.chains}+</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Chains</div>
		</div>
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-emerald-500">{stats.mainnets}+</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Mainnets</div>
		</div>
		<div class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
			<div class="text-2xl font-bold text-amber-500">{stats.testnets}+</div>
			<div class="text-sm text-slate-600 dark:text-slate-400">Testnets</div>
		</div>
	</div>

	<!-- Chain List Placeholder -->
	<section class="mb-12">
		<h2 class="text-xl font-semibold mb-4">Popular Chains</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each ['Ethereum', 'BNB Smart Chain', 'Polygon', 'Arbitrum One', 'Optimism', 'Avalanche'] as chain}
				<div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-medium">{chain}</h3>
							<p class="text-sm text-slate-500">Chain ID: --</p>
						</div>
						<button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
							Add
						</button>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Footer -->
	<footer class="text-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
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
