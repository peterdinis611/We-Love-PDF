/** In-memory handoff when user drops a PDF on the homepage hero. */
let pending: File | null = null;

export function setPendingFile(file: File): void {
	pending = file;
}

export function consumePendingFile(): File | null {
	const file = pending;
	pending = null;
	return file;
}

export function hasPendingFile(): boolean {
	return pending !== null;
}
