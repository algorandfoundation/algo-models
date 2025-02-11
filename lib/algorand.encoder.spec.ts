import { type SignKeyPair, randomBytes } from "tweetnacl"
import { sha512_256 } from "js-sha512"
import base32 from "hi-base32"
import { ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG, AlgorandEncoder, MALFORMED_ADDRESS_ERROR_MSG } from "./algorand.encoder"
import * as msgpack from "algo-msgpack-with-bigint"
import { PayTransaction } from "./algorand.transaction.pay"
import { KeyregTransaction } from "./algorand.transaction.keyreg"
import { AlgorandTransactionCrafter } from "./algorand.transaction.crafter"
import {AssetParamsBuilder} from "./algorand.asset.params";
import {AssetConfigTransaction} from "./algorand.transaction.acfg";
import {AssetFreezeTransaction} from "./algorand.transaction.afrz";
import {AssetTransferTransaction} from "./algorand.transaction.axfer";

export function concatArrays(...arrs: ArrayLike<number>[]) {
	const size = arrs.reduce((sum, arr) => sum + arr.length, 0)
	const c = new Uint8Array(size)

	let offset = 0
	for (let i = 0; i < arrs.length; i++) {
		c.set(arrs[i], offset)
		offset += arrs[i].length
	}

	return c
}

describe("Algorand Encoding", () => {
	let algoEncoder: AlgorandEncoder
	let algorandCrafter: AlgorandTransactionCrafter
	const genesisId: string = "GENESIS_ID"
	// genesis in base64
	const genesisHash: string = Buffer.from(randomBytes(32)).toString("base64")

	beforeEach(async () => {
		algoEncoder = new AlgorandEncoder()
		algorandCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
	})

	it("(OK) decodeSignedTransaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
		// to algorand address
		const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		const encodedTransaction: Uint8Array = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).get().encode()
		const signature: Uint8Array = new Uint8Array(Buffer.from(randomBytes(64)))
		const signedTransaction: Uint8Array = algorandCrafter.addSignature(encodedTransaction, signature)

		const decodedSignedTransaction: object = algoEncoder.decodeSignedTransaction(signedTransaction)
		expect(decodedSignedTransaction).toBeDefined()
		expect(decodedSignedTransaction).toEqual({
			sig: signature,
			txn: {
				rcv: algoEncoder.decodeAddress(to),
				snd: algoEncoder.decodeAddress(from),
				amt: 1000,
				fv: 1000,
				lv: 2000,
				fee: 1000,
				gen: genesisId,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				type: "pay",
			},
		})
	})

	it("(OK) encodeSignedTransaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
		// to algorand address
		const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// signature
		const signature: Uint8Array = new Uint8Array(Buffer.from(randomBytes(64)))

		// signed transaction
		const signedTxn = {
			sig: signature,
			txn: {
				rcv: algoEncoder.decodeAddress(to),
				snd: algoEncoder.decodeAddress(from),
				amt: 1000n,
				fv: 1000,
				lv: 2000,
				fee: 1000,
				gen: genesisId,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				type: "pay",
			},
		}

		// encode signed transaction
		const encodedSignedTransaction: Uint8Array = algoEncoder.encodeSignedTransaction(signedTxn)
		expect(encodedSignedTransaction).toBeDefined()
		expect(encodedSignedTransaction).toEqual(msgpack.encode(signedTxn, { sortKeys: true }))
	})

	it("(OK) encoding of pay transaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
		// to algorand address
		const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// note
		const note: string = Buffer.from(randomBytes(32)).toString("base64")

		// create pay transaction
		const txn: PayTransaction = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).addNote(note).addFee(1000).get()

		const encoded: Uint8Array = txn.encode()
		expect(encoded).toEqual(algoEncoder.encodeTransaction(txn))
	})

	it("(OK) Encoding of keyreg transaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// note
		const note: string = Buffer.from(randomBytes(32)).toString("base64")

		// vote key
		const voteKey: string = Buffer.from(randomBytes(32)).toString("base64")

		// selection key
		const selectionKey: string = Buffer.from(randomBytes(32)).toString("base64")

		// state proof key
		const stateProofKey: string = Buffer.from(randomBytes(64)).toString("base64")

		// create keyreg transaction
		const txn: KeyregTransaction = algorandCrafter
			.changeOnline(from, voteKey, selectionKey, stateProofKey, 1000, 2000, 32)
			.addFirstValidRound(1000)
			.addLastValidRound(2000)
			.addNote(note)
			.addFee(1000)
			.get()

		const encoded: Uint8Array = txn.encode()
		expect(encoded).toEqual(algoEncoder.encodeTransaction(txn))
	})
	it("(OK) Encoding of asset config transaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// note
		const note: string = Buffer.from(randomBytes(32)).toString("base64")
		const grp = randomBytes(32)
		const lx = randomBytes(32)
		const params = new AssetParamsBuilder()
			.addTotal(1)
			.addDecimals(1)
			.addDefaultFrozen(false)
			.addAssetName("Big Yeetus")
			.addUnitName("YEET")
			.addMetadataHash(randomBytes(32))
			.addClawbackAddress(from)
			.addFreezeAddress(from)
			.addManagerAddress(from)
			.addReserveAddress(from)
			.get()

		// create keyreg transaction
		const txn: AssetConfigTransaction = algorandCrafter
			.createAsset(from, params)
			.addFirstValidRound(1000)
			.addLastValidRound(2000)
			.addNote(note, "base64")
			.addFee(1000)
			.addGroup(grp)
			.addRekey(from)
			.addLease(lx)
			.get()

		const encoded: Uint8Array = txn.encode()
		expect(encoded).toEqual(algoEncoder.encodeTransaction(txn))
	})
	it("(OK) Encoding of asset freeze transaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// note
		const note: string = Buffer.from(randomBytes(32)).toString("base64")
		const grp = randomBytes(32)
		const lx = randomBytes(32)

		// create keyreg transaction
		const txn: AssetFreezeTransaction = algorandCrafter
			.freezeAsset(from, 1, true)
			.addSender(from)
			.addFirstValidRound(1000)
			.addLastValidRound(2000)
			.addNote(note, "base64")
			.addFee(1000)
			.addGroup(grp)
			.addRekey(from)
			.addLease(lx)
			.get()

		const encoded: Uint8Array = txn.encode()
		expect(encoded).toEqual(algoEncoder.encodeTransaction(txn))
	})
	it("(OK) Encoding of asset transfer transaction", async () => {
		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
		const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		// note
		const note: string = Buffer.from(randomBytes(32)).toString("base64")
		const grp = randomBytes(32)
		const lx = randomBytes(32)

		// create keyreg transaction
		const txn: AssetTransferTransaction = algorandCrafter
			.transferAsset(from, 1, to, 1)
			.addAssetCloseTo(from)
			.addAssetSender(from)
			.addFirstValidRound(1000)
			.addLastValidRound(2000)
			.addNote(note, "base64")
			.addFee(1000)
			.addGroup(grp)
			.addRekey(from)
			.addLease(lx)
			.get()

		const encoded: Uint8Array = txn.encode()
		expect(encoded).toEqual(algoEncoder.encodeTransaction(txn))
	})
	it("(OK) Encode & Decode Address ", async () => {
		const keyPair: SignKeyPair = {
			publicKey: Uint8Array.from([
				54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
			]),
			secretKey: Uint8Array.from([
				129, 128, 61, 158, 124, 215, 83, 137, 85, 47, 135, 151, 18, 162, 131, 63, 233, 138, 189, 56, 18, 114, 209, 4, 4, 128, 0, 159, 159, 76, 39, 85,
				54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
			]),
		}

		const publicKey: Uint8Array = keyPair.publicKey
		// assert public key is 32 bytes
		expect(publicKey.length).toBe(32)

		// perform sha512/sha256 on the public key
		const keyHash: string = sha512_256.create().update(publicKey).hex()

		// last 4 bytes of the hash
		const checksum: string = keyHash.slice(-8)
		const addr: string = base32.encode(concatArrays(publicKey, Buffer.from(checksum, "hex"))).slice(0, 58)

		const encodedAddress: string = algoEncoder.encodeAddress(Buffer.from(keyPair.publicKey))
		// match addresses
		expect(encodedAddress).toBe(addr)

		// decode back to public key
		const decodedPublicKey: Uint8Array = algoEncoder.decodeAddress(encodedAddress)
		// match public keys
		expect(decodedPublicKey).toEqual(publicKey)
	})

	it("(FAIL) decoding address - bad format", async () => {
		const address: string = "1234567890"
		expect(() => {
			algoEncoder.decodeAddress(address)
		}).toThrowError(MALFORMED_ADDRESS_ERROR_MSG)
	})

	it("(FAIL) decoding address - Bad checksum", async () => {
		const address: string = "EUA7ONI2JTOBMMWNYAW45BIB6HRXP3NMKMTLDBPGDCSA3PXQHI37APNMCA"
		// check length
		expect(address.length).toBe(58)

		expect(() => {
			algoEncoder.decodeAddress(address)
		}).toThrowError(ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG)
	})
})
