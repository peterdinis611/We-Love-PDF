export type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredTheme(): Theme {
	if (typeof localStorage === 'undefined') return 'system';
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	return 'system';
}

class ThemeState {
	preference = $state<Theme>(readStoredTheme());

	get resolved(): 'light' | 'dark' {
		return this.preference === 'system' ? getSystemTheme() : this.preference;
	}

	apply() {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.toggle('dark', this.resolved === 'dark');
	}

	setTheme(next: Theme) {
		this.preference = next;
		localStorage.setItem('theme', next);
		this.apply();
	}

	toggle() {
		this.setTheme(this.resolved === 'dark' ? 'light' : 'dark');
	}

	init() {
		this.apply();
		if (typeof window === 'undefined') return;
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			if (this.preference === 'system') this.apply();
		});
	}
}

export const theme = new ThemeState();
