import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
	const storedTheme = browser ? (localStorage.getItem('theme') as Theme | null) : null;
	const initialTheme = storedTheme || getSystemTheme();
	const { subscribe, set, update } = writable<Theme>(initialTheme);

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
				const next: Theme = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', next);
					applyTheme(next);
				}
				return next;
			});
		},
		init: () => {
			if (browser) {
				const stored = localStorage.getItem('theme') as Theme | null;
				const theme = stored || getSystemTheme();
				applyTheme(theme);
				set(theme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

export const theme = createThemeStore();

// Derived store to check if currently dark
export const isDark = derived(theme, ($theme) => $theme === 'dark');
