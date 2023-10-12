import { randomBytes } from "tweetnacl"
import { AlgorandEncoder } from "./algorand.encoder"
import * as msgpack from "algo-msgpack-with-bigint"
import { AlgorandTransactionCrafter } from "./algorand.transaction.crafter"
import { PayTransaction } from "./algorand.transaction.pay"
import { KeyregTransaction } from "./algorand.transaction.keyreg"
import Ajv, {type JSONSchemaType} from "ajv"
import path from "path"
import fs from 'fs'

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

describe("Algorand Transaction Crafter", () => {
	const genesisId: string = "GENESIS_ID"
	// genesis in base64
	const genesisHash: string = Buffer.from(randomBytes(32)).toString("base64")

	const algorandCrafter: AlgorandTransactionCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
	const algoEncoder: AlgorandEncoder = new AlgorandEncoder()

	it("(OK) addSignature", async () => {
		let algoEncoder: AlgorandEncoder = new AlgorandEncoder()

		// from algorand address
		const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
		// to algorand address
		const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

		const encodedTransaction: Uint8Array = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).get().encode()
		const signature: Uint8Array = Buffer.from(randomBytes(64))
		const result: Uint8Array = algorandCrafter.addSignature(encodedTransaction, signature)
		expect(result).toBeDefined()

		const expected = {
			sig: signature,
			txn: algoEncoder.decodeTransaction(encodedTransaction),
		}

		expect(result).toEqual(msgpack.encode(expected, { sortKeys: true }))
	})

	describe("Pay Transactions", () => {
		let paySchema: JSONSchemaType<PayTransaction> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/pay.transaction.json"), "utf8"))

		it("(OK) Craft Pay Transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
			// to algorand address
			const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
	
			// note
			const note: string = Buffer.from(randomBytes(128)).toString("base64")
	
			// create pay transaction
			const txn: PayTransaction = algorandCrafter
				.pay(1000, from, to)
				.addFirstValidRound(1000)
				.addLastValidRound(2000)
				.addNote(note, "base64")
				.addFee(1000)
				.get()
	
			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(PayTransaction)
			expect(txn).toEqual({
				rcv: algoEncoder.decodeAddress(to),
				snd: algoEncoder.decodeAddress(from),
				amt: 1000,
				fv: 1000,
				lv: 2000,
				gen: genesisId,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				note: new Uint8Array(Buffer.from(note, "base64")),
				fee: 1000,
				type: "pay",
			})

			const ajv = new Ajv()
			const validate = ajv.compile(paySchema)
			expect(validate(txn)).toBe(true)
		})	
	})

	describe("KeyReg Online Transactions", () => {
		let keyRegSchema: JSONSchemaType<KeyregTransaction> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/keyreg.transaction.online.json"), "utf8"))

		it("(OK) Craft Keyreg change-online transaction", async () => {
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
				.addNote(note, "base64")
				.addFee(1000)
				.get()
	
			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)

			const ajv = new Ajv()
			const validate = ajv.compile(keyRegSchema)
			expect(validate(txn)).toBe(true)

			expect(txn).toEqual({
				snd: algoEncoder.decodeAddress(from),
				votekey: new Uint8Array(Buffer.from(voteKey, "base64")),
				selkey: new Uint8Array(Buffer.from(selectionKey, "base64")),
				sprfkey: new Uint8Array(Buffer.from(stateProofKey, "base64")),
				votefst: 1000,
				votelst: 2000,
				votekd: 32,
				fv: 1000,
				lv: 2000,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				note: new Uint8Array(Buffer.from(note, "base64")),
				fee: 1000,
				type: "keyreg",
			})
		})
	})

	describe("KeyReg Offline Transactions", () => {
		let keyRegSchema: JSONSchemaType<KeyregTransaction> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/keyreg.transaction.offline.json"), "utf8"))

		it("(OK) Craft Keyreg change-offline transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
	
			// note
			const note: string = Buffer.from(randomBytes(32)).toString("base64")
	
			// create keyreg transaction
			const txn: KeyregTransaction = algorandCrafter
				.changeOffline(from)
				.addFirstValidRound(1000)
				.addLastValidRound(2000)
				.addNote(note, "base64")
				.addFee(1000)
				.get()
	
			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)
			expect(txn).toEqual({
				snd: algoEncoder.decodeAddress(from),
				fv: 1000,
				lv: 2000,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				note: new Uint8Array(Buffer.from(note, "base64")),
				fee: 1000,
				type: "keyreg",
			})

			const ajv = new Ajv()
			const validate = ajv.compile(keyRegSchema)
			expect(validate(txn)).toBe(true)
		})
	})

	describe("KeyReg Non-participation Transactions", () => {
		let keyRegSchema: JSONSchemaType<KeyregTransaction>

		beforeAll(async () => {
			keyRegSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/keyreg.transaction.nonparticipation.json"), "utf8"))
		})
		it("(OK) Craft Keyreg non-participation transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
	
			// note
			const note: string = Buffer.from(randomBytes(32)).toString("base64")
	
			// create keyreg transaction
			const txn: KeyregTransaction = algorandCrafter
				.markNonParticipation(from)
				.addFirstValidRound(1000)
				.addLastValidRound(2000)
				.addNote(note, "base64")
				.addFee(1000)
				.get()
	
			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)
			expect(txn).toEqual({
				snd: algoEncoder.decodeAddress(from),
				fv: 1000,
				lv: 2000,
				gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
				note: new Uint8Array(Buffer.from(note, "base64")),
				fee: 1000,
				type: "keyreg",
				nonpart: true,
			})

			const ajv = new Ajv()
			const validate = ajv.compile(keyRegSchema)
			expect(validate(txn)).toBe(true)
		})
	})
})
