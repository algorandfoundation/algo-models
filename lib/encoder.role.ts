export abstract class Encoder {
	constructor() {}

	abstract decodeAddress(address: string): Uint8Array
	abstract encodeAddress(publicKey: Buffer): string
	abstract encodeSignedTransaction(txn: object): Uint8Array
	abstract decodeSignedTransaction(encoded: Uint8Array): object | Error
	abstract encodeTransaction(tx: any): Uint8Array
	abstract decodeTransaction(encoded: Uint8Array): object | Error

	/**
	 *
	 * @param publicKey
	 */
	// abstract EncodeAddress(publicKey: Buffer): string

	// static ArrayEqual(a: ArrayLike<any>, b: ArrayLike<any>) {
	// 	if (a.length !== b.length) {
	// 		return false
	// 	}
	// 	return Array.from(a).every((val, i) => val === b[i])
	// }

	/**
	 *
	 * @param arrs
	 * @returns
	 */
	static ConcatArrays(...arrs: ArrayLike<number>[]) {
		const size = arrs.reduce((sum, arr) => sum + arr.length, 0)
		const c = new Uint8Array(size)

		let offset = 0
		for (let i = 0; i < arrs.length; i++) {
			c.set(arrs[i], offset)
			offset += arrs[i].length
		}

		return c
	}
}
