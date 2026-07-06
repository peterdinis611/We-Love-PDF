import { describe, expect, it } from 'vitest';
import { pptxSlidesToHtml } from '$lib/pdf/office';

describe('pptxSlidesToHtml', () => {
	it('renders slide bullets as HTML list', () => {
		const html = pptxSlidesToHtml([['Hello', 'World'], ['Second slide']], 'Deck');
		expect(html).toContain('<h1>Deck</h1>');
		expect(html).toContain('<h2>Slide 1</h2>');
		expect(html).toContain('<li>Hello</li>');
		expect(html).toContain('<li>World</li>');
		expect(html).toContain('<h2>Slide 2</h2>');
	});
});
