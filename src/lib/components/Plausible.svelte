<script lang="ts">
	import { env } from '$env/dynamic/public';

	const domain = env.PUBLIC_PLAUSIBLE_DOMAIN;
</script>

{#if domain}
	<script defer data-domain={domain} src="https://plausible.io/js/script.js"></script>
{/if}
