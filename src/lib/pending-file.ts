/** In-memory handoff when user drops PDF(s) on the homepage hero. */
let pending: File[] = [];

export function setPendingFile(file: File): void {
	pending = [file];
}

export function setPendingFiles(files: File[]): void {
	pending = files.slice();
}

export function consumePendingFile(): File | null {
	const file = pending[0] ?? null;
	pending = [];
	return file;
}

export function consumePendingFiles(): File[] {
	const files = pending;
	pending = [];
	return files;
}

export function hasPendingFile(): boolean {
	return pending.length > 0;
}
