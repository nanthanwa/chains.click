<script lang="ts">
	import type { PageData } from './$types';
	import type { ChainEIP3085 } from '$lib/types';
	import { Header } from '$lib/components';
	import { Toast } from '$lib/components';
	import { theme } from '$lib/stores/theme';
	import { toast } from '$lib/stores/toast';
	import { addChain, formatWalletError, getSuccessMessage, hasWallet, isMobileBrowser, getMobileDeepLink, getWalletDisplayName } from '$lib/wallet';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let isAdding = $state(false);

	function getIconUrl(icon: string | undefined): string {
		if (!icon) return '';
		if (icon.startsWith('ipfs://')) {
			return icon.replace('ipfs://', 'https://ipfs.io/ipfs/');
		}
		return icon;
	}

	// Build EIP-3085 format for wallet
	const chainData: ChainEIP3085 = $derived({
		chainId: `0x${data.chain.chainId.toString(16)}`,
		chainName: data.chain.name,
		nativeCurrency: data.chain.nativeCurrency,
		rpcUrls: data.chain.rpc.filter(
			(r) => r.startsWith('https://') && !r.includes('${')
		),
		blockExplorerUrls: data.chain.explorers?.map((e) => e.url),
		iconUrls: data.icon ? [getIconUrl(data.icon)] : undefined
	});

	const walletAvailable = $derived(hasWallet());
	const isMobile = $derived(isMobileBrowser());
	const walletName = $derived(getWalletDisplayName());

	// Structured data for SEO
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: `Add ${data.chain.name} to Wallet`,
		description: `One-click add ${data.chain.name} (Chain ID: ${data.chain.chainId}) to MetaMask and other Web3 wallets. RPC endpoints, native currency, and block explorers.`,
		url: `https://chains.click/chain/${data.chain.chainId}`,
		mainEntity: {
			'@type': 'SoftwareApplication',
			name: data.chain.name,
			applicationCategory: 'Blockchain Network',
			operatingSystem: 'Web3'
		}
	});

	onMount(() => {
		theme.init();
	});

	async function handleAddToWallet() {
		if (isAdding || chainData.rpcUrls.length === 0) return;

		isAdding = true;
		try {
			const result = await addChain(chainData);
			if (result.success) {
				toast.success(getSuccessMessage(result, data.chain.name));
			} else {
				toast.error(formatWalletError(result));
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to add chain');
		} finally {
			isAdding = false;
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.info('Copied to clipboard');
	}

	const isTestnet = $derived(
		data.chain.name.toLowerCase().includes('testnet') ||
		data.chain.name.toLowerCase().includes('test') ||
		data.chain.status === 'deprecated'
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Add {data.chain.name} to Wallet | chains.click</title>
	<meta name="title" content="Add {data.chain.name} to Wallet | chains.click" />
	<meta
		name="description"
		content="One-click add {data.chain.name} ({data.chain.nativeCurrency.symbol}) to MetaMask and other Web3 wallets. Chain ID: {data.chain.chainId}. {data.chain.rpc.length} RPC endpoints available."
	/>
	<link rel="canonical" href="https://chains.click/chain/{data.chain.chainId}" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://chains.click/chain/{data.chain.chainId}" />
	<meta property="og:title" content="Add {data.chain.name} to Wallet | chains.click" />
	<meta
		property="og:description"
		content="One-click add {data.chain.name} ({data.chain.nativeCurrency.symbol}) to MetaMask and other Web3 wallets. Chain ID: {data.chain.chainId}."
	/>
	<meta
		property="og:image"
		content="https://chains.click/og/chain/{data.chain.chainId}.png"
	/>

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://chains.click/chain/{data.chain.chainId}" />
	<meta property="twitter:title" content="Add {data.chain.name} to Wallet | chains.click" />
	<meta
		property="twitter:description"
		content="One-click add {data.chain.name} ({data.chain.nativeCurrency.symbol}) to MetaMask and other Web3 wallets. Chain ID: {data.chain.chainId}."
	/>
	<meta
		property="twitter:image"
		content="https://chains.click/og/chain/{data.chain.chainId}.png"
	/>

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<Header />

	<main class="container mx-auto px-4 py-6 max-w-2xl">
		<!-- Breadcrumb -->
		<nav class="mb-6 text-sm">
			<ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
				<li>
					<a href="/" class="hover:text-blue-500 transition-colors">Home</a>
				</li>
				<li>/</li>
				<li class="text-slate-900 dark:text-white font-medium truncate">
					{data.chain.name}
				</li>
			</ol>
		</nav>

		<!-- Chain Header -->
		<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
			<div class="flex items-start gap-4 mb-6">
				{#if data.icon}
					<img
						src={getIconUrl(data.icon)}
						alt="{data.chain.name} logo"
						class="w-16 h-16 rounded-full"
						loading="eager"
					/>
				{:else}
					<div class="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
						<span class="text-xl font-bold text-slate-500 dark:text-slate-400">
							{data.chain.nativeCurrency.symbol.slice(0, 2)}
						</span>
					</div>
				{/if}
				<div class="flex-1 min-w-0">
					<h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">
						{data.chain.name}
					</h1>
					<div class="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
						<span class="font-medium">{data.chain.nativeCurrency.symbol}</span>
						<span>·</span>
						<span>Chain ID: {data.chain.chainId}</span>
						{#if isTestnet}
							<span class="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
								Testnet
							</span>
						{/if}
						{#if data.chain.status === 'deprecated'}
							<span class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
								Deprecated
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Add to Wallet Button -->
			{#if walletAvailable}
				<button
					type="button"
					onclick={handleAddToWallet}
					disabled={isAdding || chainData.rpcUrls.length === 0}
					class="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 min-h-[48px] flex items-center justify-center gap-2"
				>
					{#if isAdding}
						<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						<span>Adding...</span>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						<span>Add to {walletName}</span>
					{/if}
				</button>
			{:else if isMobile}
				<div class="space-y-3">
					<p class="text-sm text-slate-500 dark:text-slate-400 text-center">
						Open in your wallet app to add this chain:
					</p>
					<div class="flex gap-2">
						<a
							href={getMobileDeepLink('metamask')}
							class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
						>
							MetaMask
						</a>
						<a
							href={getMobileDeepLink('trust')}
							class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
						>
							Trust Wallet
						</a>
					</div>
				</div>
			{:else}
				<div class="text-center space-y-2">
					<p class="text-sm text-slate-500 dark:text-slate-400">
						No wallet detected. Install a Web3 wallet to add chains.
					</p>
					<a
						href="https://metamask.io/download/"
						target="_blank"
						rel="noopener"
						class="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
					>
						Install MetaMask
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				</div>
			{/if}
		</div>

		<!-- Chain Details -->
		<div class="space-y-6">
			<!-- Native Currency -->
			<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
					Native Currency
				</h2>
				<div class="grid grid-cols-3 gap-4">
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Name</p>
						<p class="font-medium text-slate-900 dark:text-white">
							{data.chain.nativeCurrency.name}
						</p>
					</div>
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Symbol</p>
						<p class="font-medium text-slate-900 dark:text-white">
							{data.chain.nativeCurrency.symbol}
						</p>
					</div>
					<div>
						<p class="text-sm text-slate-500 dark:text-slate-400 mb-1">Decimals</p>
						<p class="font-medium text-slate-900 dark:text-white">
							{data.chain.nativeCurrency.decimals}
						</p>
					</div>
				</div>
			</section>

			<!-- RPC Endpoints -->
			{#if data.chain.rpc && data.chain.rpc.length > 0}
				<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
					<h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
						RPC Endpoints ({data.chain.rpc.length})
					</h2>
					<div class="space-y-2">
						{#each data.chain.rpc.filter(r => r.startsWith('https://') && !r.includes('${')) as rpc}
							<div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
								<code class="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
									{rpc}
								</code>
								<button
									onclick={() => copyToClipboard(rpc)}
									class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
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
			{#if data.chain.explorers && data.chain.explorers.length > 0}
				<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
					<h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
						Block Explorers
					</h2>
					<div class="grid gap-3">
						{#each data.chain.explorers as explorer}
							<a
								href={explorer.url}
								target="_blank"
								rel="noopener"
								class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group"
							>
								<div>
									<p class="font-medium text-slate-900 dark:text-white">
										{explorer.name}
									</p>
									<p class="text-sm text-slate-500 dark:text-slate-400 truncate">
										{explorer.url}
									</p>
								</div>
								<svg class="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</a>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Faucets (for testnets) -->
			{#if data.chain.faucets && data.chain.faucets.length > 0}
				<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
					<h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
						Faucets
					</h2>
					<div class="grid gap-3">
						{#each data.chain.faucets as faucet}
							<a
								href={faucet}
								target="_blank"
								rel="noopener"
								class="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors group"
							>
								<p class="text-sm text-emerald-700 dark:text-emerald-400 truncate flex-1">
									{faucet}
								</p>
								<svg class="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
							</a>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Additional Info -->
			{#if data.chain.infoURL || data.chain.shortName}
				<section class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
					<h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
						Additional Info
					</h2>
					<dl class="grid gap-4">
						{#if data.chain.shortName}
							<div>
								<dt class="text-sm text-slate-500 dark:text-slate-400">Short Name</dt>
								<dd class="font-medium text-slate-900 dark:text-white">{data.chain.shortName}</dd>
							</div>
						{/if}
						{#if data.chain.networkId && data.chain.networkId !== data.chain.chainId}
							<div>
								<dt class="text-sm text-slate-500 dark:text-slate-400">Network ID</dt>
								<dd class="font-medium text-slate-900 dark:text-white">{data.chain.networkId}</dd>
							</div>
						{/if}
						{#if data.chain.infoURL}
							<div>
								<dt class="text-sm text-slate-500 dark:text-slate-400">Website</dt>
								<dd>
									<a
										href={data.chain.infoURL}
										target="_blank"
										rel="noopener"
										class="text-blue-500 hover:text-blue-600 hover:underline"
									>
										{data.chain.infoURL}
									</a>
								</dd>
							</div>
						{/if}
					</dl>
				</section>
			{/if}
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-8">
		<div class="container mx-auto px-4 py-6 max-w-2xl">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
				<p>
					Data from
					<a href="https://github.com/ethereum-lists/chains" target="_blank" rel="noopener" class="text-blue-500 hover:underline">
						ethereum-lists/chains
					</a>
				</p>
				<div class="flex items-center gap-4">
					<a href="/" class="hover:text-slate-700 dark:hover:text-slate-300">All Chains</a>
					<a href="/api/chains/{data.chain.chainId}" class="hover:text-slate-700 dark:hover:text-slate-300">API</a>
					<a href="https://github.com/nanthanwa/chains.click" target="_blank" rel="noopener" class="hover:text-slate-700 dark:hover:text-slate-300">GitHub</a>
				</div>
			</div>
		</div>
	</footer>
</div>

<Toast />
