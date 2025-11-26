import { sha512_256 } from "js-sha512"
import * as msgpack from "algo-msgpack-with-bigint"
import base32 from "hi-base32"
import { Encoder } from "./encoder.role.js"
import { SignedTransaction, Transaction } from "./algorand.transaction.js"

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
export class AlgorandEncoder extends Encoder {
	/**
	 * decodeAddress takes an Algorand address in string form and decodes it into a Uint8Array.
	 * Returns undefined if the address is the zero address.
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
	 * Encodes a signed transaction
	 * @param stx - The signed transaction object to encode.
	 * @returns The encoded signed transaction as a Uint8Array
	 */
	encodeSignedTransaction(stx: object): Uint8Array {
		const encodedTxn: Uint8Array = new Uint8Array(msgpack.encode(stx, { sortKeys: true, ignoreUndefined: true }))
		return encodedTxn
	}

	/**
	 * Encodes a transaction and prepares it for signing by adding the "TX" tag
	 * @param tx
	 */
	encodeTransaction(tx: Transaction): Uint8Array {
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
	decodeTransaction(encoded: Uint8Array): Transaction {
		const TAG: Buffer = Buffer.from("TX")
		const tagBytes: number = TAG.byteLength

		// remove tag Bytes for the tag and decode the rest
		const decoded: object = msgpack.decode(encoded.slice(tagBytes)) as object
		return decoded as Transaction
	}

	/**
	 *
	 * @param encoded
	 * @returns
	 */
	decodeSignedTransaction(encoded: Uint8Array): SignedTransaction {
		const decoded: SignedTransaction = msgpack.decode(encoded) as SignedTransaction
		return decoded
	}

	// calculate group id
	computeGroupId(txns: Uint8Array[]): Uint8Array {
		// ensure nr of txns in group are between 0 and 16
		if (txns.length < 1 || txns.length > 16) throw new Error("Invalid number of transactions in group")


		const hashes: Uint8Array[] = txns.map(txn => {
			let encoded: Uint8Array

			try {
				// verify if it includes signature
				const decodedTxn: SignedTransaction = this.decodeSignedTransaction(txn)
				encoded = this.encodeTransaction(decodedTxn.txn)
			} catch (error) {
				// txn is already without signature, proceed without further processing
				encoded = txn
			}

			return Uint8Array.from(sha512_256.array(encoded))
		})

		// encode { txList: [tx1, tx2, ...] } with msgpack
		const encodedTxList: Uint8Array = msgpack.encode({ txlist: hashes }, { sortKeys: true, ignoreUndefined: true })

		// Concat group tag + encoded
		const concatTagList: Uint8Array = Encoder.ConcatArrays(Buffer.from("TG"), encodedTxList)

		// return sha512_256 hash
		return Uint8Array.from(sha512_256.array(concatTagList))
	}

	/**
	 * Casts a number or bigint to BigInt and checks if it's within the safe integer range.
	 * If the value is 0, returns undefined to force msgpack to omit the field.
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