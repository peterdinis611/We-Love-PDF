import { redirect } from '@sveltejs/kit';
import { parseLocale } from '$lib/i18n/locale';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	if (params.lang && params.lang !== 'sk') {
		redirect(307, '/');
	}
	return { locale: parseLocale(params.lang) };
};
