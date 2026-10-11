export type FieldKind = "head" | "length" | "extended" | "mask" | "payload";

export interface FrameField {
	kind: FieldKind;
	name: string;
	bytes: Uint8Array;
	bits?: string;
	notes: string[];
}

const encoder = new TextEncoder();

export const toHex = (byte: number) =>
	byte.toString(16).padStart(2, "0").toUpperCase();

export const toBits = (byte: number) => {
	const bits = byte.toString(2).padStart(8, "0");
	return `${bits.slice(0, 4)} ${bits.slice(4)}`;
};

// Lays out a single, final text frame exactly as RFC 6455 section 5.2 puts it
// on the wire. Pass a masking key for client-to-server frames.
export const buildTextFrame = (
	text: string,
	maskKey?: Uint8Array
): FrameField[] => {
	const payload = encoder.encode(text);
	const length = payload.length;
	const length7 = length <= 125 ? length : length <= 0xffff ? 126 : 127;
	const second = (maskKey ? 0b10000000 : 0) | length7;

	const fields: FrameField[] = [
		{
			kind: "head",
			name: "FIN + opcode",
			bytes: Uint8Array.of(0b10000001),
			bits: toBits(0b10000001),
			notes: [
				"FIN = 1, this is the last frame of the message",
				"RSV1-3 = 0, no extensions",
				"opcode = 0x1, the payload is text",
			],
		},
		{
			kind: "length",
			name: "MASK + length",
			bytes: Uint8Array.of(second),
			bits: toBits(second),
			notes: [
				maskKey
					? "MASK = 1, clients must mask what they send"
					: "MASK = 0, servers never mask",
				length7 === 126
					? "length = 126, the real length is in the next 2 bytes"
					: length7 === 127
						? "length = 127, the real length is in the next 8 bytes"
						: `length = ${length} bytes`,
			],
		},
	];

	if (length7 === 126) {
		fields.push({
			kind: "extended",
			name: "Extended length",
			bytes: Uint8Array.of(length >> 8, length & 0xff),
			notes: [`16-bit big-endian length = ${length} bytes`],
		});
	} else if (length7 === 127) {
		const extended = new Uint8Array(8);
		new DataView(extended.buffer).setBigUint64(0, BigInt(length));
		fields.push({
			kind: "extended",
			name: "Extended length",
			bytes: extended,
			notes: [`64-bit big-endian length = ${length} bytes`],
		});
	}

	if (maskKey) {
		fields.push({
			kind: "mask",
			name: "Masking key",
			bytes: maskKey,
			notes: ["4 random bytes chosen by the client for this frame"],
		});
		fields.push({
			kind: "payload",
			name: "Payload (masked)",
			bytes: payload.map((byte, i) => byte ^ (maskKey[i % 4] ?? 0)),
			notes: [
				"Each byte is XOR-ed with key[i % 4]",
				"The server XORs again with the same key to read it",
			],
		});
	} else {
		fields.push({
			kind: "payload",
			name: "Payload",
			bytes: payload,
			notes: ["UTF-8 text, sent as is"],
		});
	}

	return fields;
};

export const frameSize = (fields: FrameField[]) =>
	fields.reduce((total, field) => total + field.bytes.length, 0);
