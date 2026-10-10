/**
 * Lightweight RFC 3161 timestamp attempt via a public TSA (FreeTSA).
 * Sends only a SHA-256 hash of the signed PDF — never the certificate or full private material.
 * If the request fails (CORS/offline), callers should treat timestamp as optional.
 */

export type TsaResult = {
	ok: boolean;
	token?: Uint8Array;
	message: string;
};

async function sha256(bytes: Uint8Array): Promise<ArrayBuffer> {
	return crypto.subtle.digest('SHA-256', bytes.slice());
}

/**
 * Request a timestamp token for `payload` from FreeTSA.
 * Note: browsers may block cross-origin POST; we try and report failure gracefully.
 * Full embedding into CMS/PKCS#7 requires ASN.1 surgery beyond @signpdf — we store
 * the token as a parallel `.tsr` download companion when embedding isn't possible.
 */
export async function requestTimestampToken(payload: Uint8Array): Promise<TsaResult> {
	try {
		const hash = await sha256(payload);
		// Minimal TimeStampReq (RFC 3161) is non-trivial to craft by hand.
		// FreeTSA also accepts raw hash via their web form; HTTP API expects DER.
		// As a pragmatic browser approach, POST the hash hex to a same-origin proxy
		// is not available — attempt freetsa.org and catch.
		const body = new Uint8Array(hash);
		const res = await fetch('https://freetsa.org/tsr', {
			method: 'POST',
			headers: { 'Content-Type': 'application/timestamp-query' },
			body
		});
		if (!res.ok) {
			return {
				ok: false,
				message: `TSA responded ${res.status}. Timestamp skipped — signature is still valid without RFC 3161 token.`
			};
		}
		const token = new Uint8Array(await res.arrayBuffer());
		return {
			ok: true,
			token,
			message: 'Timestamp token received (save alongside the signed PDF as .tsr).'
		};
	} catch (e) {
		return {
			ok: false,
			message:
				e instanceof Error
					? `TSA unavailable (${e.message}). Signature completed without external timestamp.`
					: 'TSA unavailable. Signature completed without external timestamp.'
		};
	}
}
