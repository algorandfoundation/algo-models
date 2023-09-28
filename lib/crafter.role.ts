export abstract class Crafter {
	abstract addSignature(encodedTransaction: Uint8Array, signature: Uint8Array): Uint8Array
}
