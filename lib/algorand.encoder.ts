import { sha512_256 } from "js-sha512"
import * as msgpack from "algo-msgpack-with-bigint"
import base32 from "hi-base32"
import { PayTransaction } from "./algorand.transaction.pay.js"
import { Encoder } from "./encoder.role.js"
import { KeyregTransaction } from "./algorand.transaction.keyreg.js"

const ALGORAND_PUBLIC_KEY_BYTE_LENGTH = 32
const ALGORAND_ADDRESS_BYTE_LENGTH = 36
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4
const ALGORAND_ADDRESS_LENGTH = 58
const HASH_BYTES_LENGTH = 32
/**
 * @internal
 */
export const MALFORMED_ADDRESS_ERROR_MSG = "Malformed address"
/**
 * @internal
 */
export const ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG = "Bad checksum"

/**
 * @category Encoding
 */
export class AlgorandEncoder extends Encoder{
	/**
	 * decodeAddress takes an Algorand address in string form and decodes it into a Uint8Array.
	 * @param address - an Algorand address with checksum.
	 * @returns the decoded form of the address's public key and checksum
	 */
	decodeAddress(address: string): Uint8Array {
		if (typeof address !== "string" || address.length !== ALGORAND_ADDRESS_LENGTH) throw new Error(MALFORMED_ADDRESS_ERROR_MSG)

		// try to decode
		const decoded = base32.decode.asBytes(address.toString())

		// Find publickey and checksum
		const pk = new Uint8Array(decoded.slice(0, ALGORAND_ADDRESS_BYTE_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH))
		const cs = new Uint8Array(decoded.slice(ALGORAND_PUBLIC_KEY_BYTE_LENGTH, ALGORAND_ADDRESS_BYTE_LENGTH))

		// Compute checksum
		const checksum = sha512_256.array(pk).slice(HASH_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH, HASH_BYTES_LENGTH)

		// Check if the checksum and the address are equal
		if (checksum.length !== cs.length || !Array.from(checksum).every((val, i) => val === cs[i])) {
			throw new Error(ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG)
		}

		return pk
	}
	/**
	 *
	 */
	encodeAddress(publicKey: Buffer): string {
		const keyHash: string = sha512_256.create().update(publicKey).hex()

		// last 4 bytes of the hash
		const checksum: string = keyHash.slice(-8)

		return base32.encode(Encoder.ConcatArrays(publicKey, Buffer.from(checksum, "hex"))).slice(0, 58)
	}

	/**
	 * 
	 * @param stx 
	 * @returns 
	 */
	encodeSignedTransaction(stx: object): Uint8Array {
		const encodedTxn: Uint8Array = new Uint8Array(msgpack.encode(stx, { sortKeys: true, ignoreUndefined: true }))
		return encodedTxn
	}

	/**
	 *
	 * @param tx
	 */
	encodeTransaction(tx: any): Uint8Array {
		// [TAG] [AMT] .... [NOTE] [RCV] [SND] [] [TYPE]
		const encoded: Uint8Array = msgpack.encode(tx, { sortKeys: true, ignoreUndefined: true })

		// tag
		const TAG: Buffer = Buffer.from("TX")

		// concat tag + encoded
		const encodedTx: Uint8Array = Encoder.ConcatArrays(TAG, encoded)

		return encodedTx
	}

	/**
	 *
	 * @param encoded
	 * @returns
	 */
	decodeTransaction(encoded: Uint8Array): object | Error {
		const TAG: Buffer = Buffer.from("TX")
		const tagBytes: number = TAG.byteLength

		// remove tag Bytes for the tag and decode the rest
		const decoded: object = msgpack.decode(encoded.slice(tagBytes)) as object
		return decoded as PayTransaction | KeyregTransaction
	}

	/**
	 *
	 * @param encoded
	 * @returns
	 */
	decodeSignedTransaction(encoded: Uint8Array): object | Error {
		const decoded: object = msgpack.decode(encoded) as object
		return decoded as object
	}

	/**
	 * Casts a number or bigint to BigInt and checks if it's within the safe integer range.
	 * @param value - The number or bigint to be casted.
	 * @returns The value as a BigInt.
	 * @throws Error if the value is not within the safe integer range.
	 */
	static safeCastBigInt(value: number | bigint): bigint {
		const bigIntValue = BigInt(value)
if (typeof value === "number" && (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER)) {
			throw new Error("Value is not within the safe integer range")
		}
		return bigIntValue
	}
}
