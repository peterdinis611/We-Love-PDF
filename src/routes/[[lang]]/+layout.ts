import { redirect } from '@sveltejs/kit';
import { isValidLangParam, parseLocale } from '$lib/i18n/locale';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	if (params.lang && !isValidLangParam(params.lang)) {
		redirect(307, '/');
	}
	return { locale: parseLocale(params.lang) };
};
