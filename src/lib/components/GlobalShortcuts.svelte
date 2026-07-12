<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { globalUi } from '$lib/global-ui.svelte';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';

	onMount(() => {
		let pendingG = false;
		let gTimer: ReturnType<typeof setTimeout> | undefined;
		let currentLocale: Locale = 'en';

		const unsub = page.subscribe((p) => {
			currentLocale = (p.data.locale as Locale | undefined) ?? 'en';
		});

		function isTypingContext() {
			const tag = document.activeElement?.tagName;
			return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
		}

		function onKeydown(e: KeyboardEvent) {
			if (isTypingContext()) return;
			if (globalUi.paletteOpen || globalUi.helpOpen) {
				if (e.key === 'Escape') {
					globalUi.setPaletteOpen(false);
					globalUi.setHelpOpen(false);
				}
				return;
			}

			if (e.metaKey || e.ctrlKey || e.altKey) return;

			if (e.key === '?') {
				e.preventDefault();
				globalUi.setHelpOpen(true);
				return;
			}

			if (e.key === '/') {
				const path = window.location.pathname;
				const onHome = path === '/' || /^\/(sk|cs|de|pl)\/?$/.test(path);
				if (!onHome) {
					e.preventDefault();
					globalUi.setPaletteOpen(true);
				}
				return;
			}

			if (e.key === 'g') {
				pendingG = true;
				clearTimeout(gTimer);
				gTimer = setTimeout(() => (pendingG = false), 800);
				return;
			}

			if (pendingG && e.key === 'm') {
				e.preventDefault();
				pendingG = false;
				clearTimeout(gTimer);
				goto(toolPath('merge-pdf', currentLocale));
			}
		}

		window.addEventListener('keydown', onKeydown);
		return () => {
			window.removeEventListener('keydown', onKeydown);
			clearTimeout(gTimer);
			unsub();
		};
	});
</script>
