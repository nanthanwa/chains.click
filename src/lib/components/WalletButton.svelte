<script lang="ts">
	import { hasWallet, isMobileBrowser, getMobileDeepLink, getWalletDisplayName } from '$lib/wallet';

	let {
		onclick,
		loading = false,
		variant = 'primary',
		size = 'md',
		class: className = ''
	}: {
		onclick?: () => void;
		loading?: boolean;
		variant?: 'primary' | 'secondary';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const walletAvailable = $derived(hasWallet());
	const isMobile = $derived(isMobileBrowser());
	const walletName = $derived(getWalletDisplayName());

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm min-h-[36px]',
		md: 'px-4 py-2 text-sm min-h-[44px]',
		lg: 'px-6 py-3 text-base min-h-[48px]'
	};

	const variantClasses = {
		primary: 'bg-blue-500 hover:bg-blue-600 text-white',
		secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
	};
</script>

{#if walletAvailable}
	<button
		type="button"
		{onclick}
		disabled={loading}
		class={`font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
	>
		{#if loading}
			<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
			<span>Adding...</span>
		{:else}
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
			<span>Add to {walletName}</span>
		{/if}
	</button>
{:else if isMobile}
	<div class="flex flex-col gap-2">
		<p class="text-xs text-slate-500 dark:text-slate-400 text-center">Open in wallet app:</p>
		<div class="flex gap-2 justify-center">
			<a
				href={getMobileDeepLink('metamask')}
				class={`font-medium rounded-xl transition-colors flex items-center gap-2 ${sizeClasses.sm} ${variantClasses.secondary}`}
			>
				MetaMask
			</a>
			<a
				href={getMobileDeepLink('trust')}
				class={`font-medium rounded-xl transition-colors flex items-center gap-2 ${sizeClasses.sm} ${variantClasses.secondary}`}
			>
				Trust
			</a>
		</div>
	</div>
{:else}
	<div class="text-center">
		<p class="text-sm text-slate-500 dark:text-slate-400">
			No wallet detected.
			<a href="https://metamask.io" target="_blank" rel="noopener" class="text-blue-500 hover:underline">
				Install MetaMask
			</a>
		</p>
	</div>
{/if}
