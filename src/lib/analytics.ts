import { browser } from '$app/environment';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

type PlausibleProps = Record<string, string | number | boolean | undefined>;

declare global {
	interface Window {
		plausible?: (event: string, options?: { props?: PlausibleProps }) => void;
	}
}

function currentToolSlug(): string {
	if (!browser) return 'unknown';
	const match = window.location.pathname.match(/\/tools\/([^/?#]+)/);
	return match?.[1] ?? 'unknown';
}

/** Fire a Plausible custom event (no-op if analytics unset). Never send file contents. */
export function track(event: string, props: PlausibleProps = {}): void {
	if (!browser) return;
	try {
		window.plausible?.(event, { props });
	} catch {
		/* ignore */
	}
}

export function trackToolStart(tool = currentToolSlug()): void {
	track('tool_start', { tool });
}

export function trackToolSuccess(tool = currentToolSlug()): void {
	track('tool_success', { tool });
}

export function trackDownload(tool = currentToolSlug()): void {
	track('download', { tool });
}

function reportVital(metric: Metric): void {
	track('web_vital', {
		name: metric.name,
		// Round for privacy / cardinality
		value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
		rating: metric.rating
	});
}

/** Register Core Web Vitals → Plausible (once per page load). */
export function initWebVitals(): void {
	if (!browser) return;
	onLCP(reportVital);
	onINP(reportVital);
	onCLS(reportVital);
	onFCP(reportVital);
	onTTFB(reportVital);
}
