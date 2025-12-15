<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>chains.click - Add chains to your wallet with one click</title>
	<meta name="description" content="Add blockchain networks to MetaMask and other wallets instantly. Support for 800+ EVM chains." />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
	{@render children()}
</div>
