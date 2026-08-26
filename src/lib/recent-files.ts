const DB_NAME = 'welovepdf-files';
const STORE = 'recent';
const DB_VERSION = 1;
const MAX_FILES = 8;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type RecentFileRecord = {
	id: string;
	name: string;
	size: number;
	mime: string;
	updatedAt: number;
	toolSlug?: string;
	bytes: ArrayBuffer;
};

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
	});
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
	});
}

export async function listRecentFiles(): Promise<Omit<RecentFileRecord, 'bytes'>[]> {
	if (typeof indexedDB === 'undefined') return [];
	const db = await openDb();
	try {
		const tx = db.transaction(STORE, 'readonly');
		const all = (await idbReq(tx.objectStore(STORE).getAll())) as RecentFileRecord[];
		const now = Date.now();
		const fresh = all
			.filter((r) => now - r.updatedAt < TTL_MS)
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, MAX_FILES);
		return fresh.map(({ bytes: _b, ...meta }) => meta);
	} finally {
		db.close();
	}
}

export async function getRecentFile(id: string): Promise<File | null> {
	if (typeof indexedDB === 'undefined') return null;
	const db = await openDb();
	try {
		const tx = db.transaction(STORE, 'readonly');
		const rec = (await idbReq(tx.objectStore(STORE).get(id))) as RecentFileRecord | undefined;
		if (!rec) return null;
		if (Date.now() - rec.updatedAt >= TTL_MS) {
			await deleteRecentFile(id);
			return null;
		}
		return new File([rec.bytes], rec.name, {
			type: rec.mime || 'application/pdf',
			lastModified: rec.updatedAt
		});
	} finally {
		db.close();
	}
}

export async function saveRecentFile(file: File, toolSlug?: string): Promise<string | null> {
	if (typeof indexedDB === 'undefined') return null;
	if (file.size > MAX_BYTES) return null;

	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	const bytes = await file.arrayBuffer();
	const record: RecentFileRecord = {
		id,
		name: file.name,
		size: file.size,
		mime: file.type || 'application/pdf',
		updatedAt: Date.now(),
		toolSlug,
		bytes
	};

	const db = await openDb();
	try {
		const tx = db.transaction(STORE, 'readwrite');
		const store = tx.objectStore(STORE);
		await idbReq(store.put(record));
		const all = (await idbReq(store.getAll())) as RecentFileRecord[];
		const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt);
		const toDelete = sorted.slice(MAX_FILES);
		for (const old of toDelete) {
			await idbReq(store.delete(old.id));
		}
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error ?? new Error('IndexedDB tx failed'));
		});
		return id;
	} catch {
		return null;
	} finally {
		db.close();
	}
}

export async function deleteRecentFile(id: string): Promise<void> {
	if (typeof indexedDB === 'undefined') return;
	const db = await openDb();
	try {
		const tx = db.transaction(STORE, 'readwrite');
		await idbReq(tx.objectStore(STORE).delete(id));
	} finally {
		db.close();
	}
}

export async function clearRecentFiles(): Promise<void> {
	if (typeof indexedDB === 'undefined') return;
	const db = await openDb();
	try {
		const tx = db.transaction(STORE, 'readwrite');
		await idbReq(tx.objectStore(STORE).clear());
	} finally {
		db.close();
	}
}
