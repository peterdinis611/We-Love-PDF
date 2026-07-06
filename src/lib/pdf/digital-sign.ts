import { Buffer } from 'buffer';
import signpdf from '@signpdf/signpdf';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { P12Signer } from '@signpdf/signer-p12';

export interface DigitalSignOptions {
	reason?: string;
	location?: string;
	contactInfo?: string;
	name?: string;
}

export async function signPdfWithCertificate(
	pdfBytes: Uint8Array,
	p12Bytes: Uint8Array,
	password: string,
	options: DigitalSignOptions = {}
): Promise<Uint8Array> {
	const pdfBuffer = Buffer.from(pdfBytes);
	const p12Buffer = Buffer.from(p12Bytes);

	const withPlaceholder = plainAddPlaceholder({
		pdfBuffer,
		reason: options.reason?.trim() || 'Document signed digitally',
		contactInfo: options.contactInfo?.trim() || '',
		name: options.name?.trim() || '',
		location: options.location?.trim() || ''
	});

	const signer = new P12Signer(p12Buffer, { passphrase: password });
	const signed = await signpdf.sign(withPlaceholder, signer);
	return new Uint8Array(signed);
}
