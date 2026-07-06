const CACHE = 'welovepdf-v3';
const SHELL = ['/', '/sk', '/changelog', '/sk/changelog', '/manifest.webmanifest'];

const IMMUTABLE = /\.(wasm|woff2?|png|jpg|svg|ico)$/i;
const APP_ASSET = /\/_app\//;

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
		)
	);
	self.clients.claim();
});

async function cacheFirst(request) {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok) cache.put(request, response.clone());
	return response;
}

async function networkFirst(request) {
	const cache = await caches.open(CACHE);
	try {
		const response = await fetch(request);
		if (response.ok) cache.put(request, response.clone());
		return response;
	} catch {
		const cached = await cache.match(request);
		if (cached) return cached;
		throw new Error('Offline');
	}
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	const isImmutable = IMMUTABLE.test(url.pathname) || APP_ASSET.test(url.pathname);
	const isNavigate = event.request.mode === 'navigate';

	if (isImmutable) {
		event.respondWith(cacheFirst(event.request));
		return;
	}

	if (isNavigate) {
		event.respondWith(networkFirst(event.request));
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				if (response.ok && (isImmutable || url.pathname.endsWith('.js'))) {
					const clone = response.clone();
					caches.open(CACHE).then((cache) => cache.put(event.request, clone));
				}
				return response;
			})
			.catch(() => caches.match(event.request))
	);
});
