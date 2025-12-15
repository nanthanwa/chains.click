<script lang="ts">
	import { toast, type Toast } from '$lib/stores/toast';
	import { fly, fade } from 'svelte/transition';

	const icons: Record<string, string> = {
		success: '✓',
		error: '✕',
		info: 'ℹ',
		warning: '⚠'
	};

	const colors: Record<string, string> = {
		success: 'bg-emerald-500',
		error: 'bg-red-500',
		info: 'bg-blue-500',
		warning: 'bg-amber-500'
	};

	function handleDismiss(id: string) {
		toast.remove(id);
	}
</script>

<div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
	{#each $toast as t (t.id)}
		<div
			in:fly={{ y: 20, duration: 200 }}
			out:fade={{ duration: 150 }}
			class="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
		>
			<div
				class={`flex-shrink-0 w-8 h-8 ${colors[t.type]} rounded-full flex items-center justify-center text-white font-bold`}
			>
				{icons[t.type]}
			</div>
			<p class="flex-1 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
			<button
				onclick={() => handleDismiss(t.id)}
				class="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
				aria-label="Dismiss"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/each}
</div>
