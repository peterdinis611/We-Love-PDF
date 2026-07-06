// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface PageData {
			locale: import('$lib/i18n/locale').Locale;
		}
	}
}

export {};
