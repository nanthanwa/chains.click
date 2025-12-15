import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	const storedTheme = browser ? (localStorage.getItem('theme') as Theme) : null;
	const { subscribe, set, update } = writable<Theme>(storedTheme || 'system');

	return {
		subscribe,
		set: (value: Theme) => {
			if (browser) {
				localStorage.setItem('theme', value);
				applyTheme(value);
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const next = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', next);
					applyTheme(next);
				}
				return next;
			});
		},
		init: () => {
			if (browser) {
				const stored = localStorage.getItem('theme') as Theme;
				const theme = stored || 'system';
				applyTheme(theme);
				set(theme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const root = document.documentElement;
	const isDark =
		theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

	if (isDark) {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

export const theme = createThemeStore();
