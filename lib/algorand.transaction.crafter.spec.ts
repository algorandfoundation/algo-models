import { randomBytes } from "tweetnacl"
import { AlgorandEncoder } from "./algorand.encoder"
import * as msgpack from "algo-msgpack-with-bigint"
import { AlgorandTransactionCrafter } from "./algorand.transaction.crafter"
import { PayTransaction } from "./algorand.transaction.pay"
import { KeyregTransaction } from "./algorand.transaction.keyreg"
import Ajv, { type JSONSchemaType } from "ajv"
import addFormat from 'ajv-formats'
import addKeywords from 'ajv-keywords'
import path from "path"
import fs from 'fs'
import { AssetConfigTransaction } from "./algorand.transaction.acfg";
import { AssetParamsBuilder } from "./algorand.asset.params";
import { AssetTransferTransaction } from "./algorand.transaction.axfer";
import { AssetFreezeTransaction } from "./algorand.transaction.afrz";
import { ITransactionHeaderBuilder, TransactionHeader } from "./algorand.transaction.header";


// Setup Validator
const ajv = new Ajv()
addFormat(ajv)

// Define the custom keyword 'typeof'
ajv.addKeyword({
	keyword: 'typeof',
	validate: function (schema: string, data: any) {
		if (schema === 'bigint') {
			return typeof data === 'bigint';
		}

		console.log("Unknown type: ", schema)

		// Add more types as needed
		return false;
	},
	errors: false
});

ajv.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/bytes32.json"), "utf8")))
ajv.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/bytes64.json"), "utf8")))
ajv.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/transaction.header.json"), "utf8")))
ajv.addSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/asset.params.json"), "utf8")))


describe("Algorand Transaction Crafter", () => {
	let algorandCrafter: AlgorandTransactionCrafter
	let algoEncoder: AlgorandEncoder

	const genesisId: string = "GENESIS_ID"
	// genesis in base64
	const genesisHash: string = Buffer.from(randomBytes(32)).toString("base64")

	let transactionHeader: Omit<TransactionHeader, "type">
	function withTestTransactionHeader<T extends ITransactionHeaderBuilder<T>>(
		builder: ITransactionHeaderBuilder<T>
	) {
		const { snd, note, grp, lx, fee, fv, lv } = transactionHeader
		return builder
			.addSender(algoEncoder.encodeAddress(Buffer.from(snd)))
			.addFirstValidRound(fv)
			.addLastValidRound(lv)
			.addNote(Buffer.from(note!).toString("base64"), "base64")
			.addFee(fee!)
			.addGroup(grp!)
			.addRekey(algoEncoder.encodeAddress(Buffer.from(snd)))
			.addLease(lx!)
	}

	beforeEach(async () => {
		algorandCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
		algoEncoder = new AlgorandEncoder()
		const sender = randomBytes(32)
		// Default Header
		transactionHeader = {
			snd: sender,
			note: randomBytes(128),
			grp: randomBytes(32),
			lx: randomBytes(32),
			gen: genesisId,
			gh: new Uint8Array(Buffer.from(genesisHash, "base64")),
			fee: 1000n,
			fv: 1000n,
			lv: 2000n,
			rekey: sender
		}
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

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
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))
			// to algorand address
			const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))

			// create pay transaction
			const txn: PayTransaction = withTestTransactionHeader(
				algorandCrafter
					.pay(1000, from, to)
					.addCloseTo(from)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(PayTransaction)
			expect(txn).toEqual({
				rcv: algoEncoder.decodeAddress(to),
				type: "pay",
				amt: 1000n,
				close: algoEncoder.decodeAddress(from),
				...transactionHeader,
			})

			const validate = ajv.compile(paySchema)
			expect(validate(txn)).toBe(true)
		})
	})

	describe("KeyReg Online Transactions", () => {
		let keyRegSchema: JSONSchemaType<KeyregTransaction> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/keyreg.transaction.online.json"), "utf8"))

		it("(OK) Craft Keyreg change-online transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// vote key
			const voteKey: string = Buffer.from(randomBytes(32)).toString("base64")

			// selection key
			const selectionKey: string = Buffer.from(randomBytes(32)).toString("base64")

			// state proof key
			const stateProofKey: string = Buffer.from(randomBytes(64)).toString("base64")

			// create keyreg transaction
			const txn: KeyregTransaction = withTestTransactionHeader(
				algorandCrafter
					.changeOnline(from, voteKey, selectionKey, stateProofKey, 1000, 2000, 32)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)

			const validate = ajv.compile(keyRegSchema)
			expect(validate(txn)).toBe(true)

			expect(txn).toEqual({
				votekey: new Uint8Array(Buffer.from(voteKey, "base64")),
				selkey: new Uint8Array(Buffer.from(selectionKey, "base64")),
				sprfkey: new Uint8Array(Buffer.from(stateProofKey, "base64")),
				votefst: 1000n,
				votelst: 2000n,
				votekd: 32n,
				type: "keyreg",
				...transactionHeader,
			})
		})
	})

	describe("KeyReg Offline Transactions", () => {
		let keyRegSchema: JSONSchemaType<KeyregTransaction> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/keyreg.transaction.offline.json"), "utf8"))

		it("(OK) Craft Keyreg change-offline transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// create keyreg transaction
			const txn: KeyregTransaction = withTestTransactionHeader(algorandCrafter
				.changeOffline(from)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)
			expect(txn).toEqual({
				type: "keyreg",
				...transactionHeader,
			})

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
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// note
			const note: string = Buffer.from(randomBytes(32)).toString("base64")

			// create keyreg transaction
			const txn: KeyregTransaction = withTestTransactionHeader(
				algorandCrafter
					.markNonParticipation(from)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(KeyregTransaction)
			expect(txn).toEqual({
				type: "keyreg",
				nonpart: true,
				selkey: undefined,

				...transactionHeader,
			})

			const validate = ajv.compile(keyRegSchema)
			expect(validate(txn)).toBe(true)
		})
	})

	describe("Asset Config Transactions", () => {
		let assetConfigSchema: JSONSchemaType<AssetConfigTransaction>

		beforeAll(async () => {
			assetConfigSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/acfg.transaction.json"), "utf8"))
		})
		it("(OK) Craft Asset Config create transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			const params = new AssetParamsBuilder()
				.addTotal(1)
				.addDecimals(1)
				.addAssetName("Big Yeetus")
				.addUnitName("YEET")
				.addClawbackAddress(from)
				.addFreezeAddress(from)
				.addManagerAddress(from)
				.get()

			// create asset transaction
			const txn: AssetConfigTransaction = withTestTransactionHeader(
				algorandCrafter
					.createAsset(from, params)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(AssetConfigTransaction)
			expect(txn).toEqual({
				type: "acfg",
				apar: params,
				caid: undefined,
				...transactionHeader,
			})

			const validate = ajv.compile(assetConfigSchema)
			expect(validate(txn)).toBe(true)


			// Test that encoding is the same when some fields are explicitly set to their default values 
			const params2 = new AssetParamsBuilder()
				.addTotal(1)
				.addDecimals(1)
				.addDefaultFrozen(false) // explicitly set to default value
				.addAssetName("Big Yeetus")
				.addUnitName("YEET")
				.addMetadataHash(new Uint8Array(32)) // explicitly set to all zero hash
				.addClawbackAddress(from)
				.addFreezeAddress(from)
				.addManagerAddress(from)
				.addReserveAddress("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ") // explicitly set to Zero Address
				.get()

			const txn2 = withTestTransactionHeader(algorandCrafter.createAsset(from, params2)).get()
			expect(txn.encode()).toEqual(txn2.encode())
		})
		it("(OK) Craft AssetConfig destroy transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// destroy asset config
			const txn: AssetConfigTransaction = withTestTransactionHeader(
				algorandCrafter
					.destroyAsset(from, 1)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(AssetConfigTransaction)
			expect(txn).toEqual({
				type: "acfg",
				apar: undefined,
				caid: 1n,
				...transactionHeader,
			})

			const validate = ajv.compile(assetConfigSchema)
			expect(validate(txn)).toBe(true)
		})
	})
	describe("Asset Freeze Transactions", () => {
		let assetFreezeSchema: JSONSchemaType<AssetFreezeTransaction>

		beforeAll(async () => {
			assetFreezeSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/afrz.transaction.json"), "utf8"))
		})
		it("(OK) Craft Asset Freeze transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// create freeze transaction
			const txn: AssetFreezeTransaction = withTestTransactionHeader(
				algorandCrafter
					.freezeAsset(from, 1, true),
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(AssetFreezeTransaction)
			expect(txn).toEqual({
				type: "afrz",
				fadd: algoEncoder.decodeAddress(from),
				faid: 1n,
				afrz: true,
				...transactionHeader,
			})

			const validate = ajv.compile(assetFreezeSchema)
			expect(validate(txn)).toBe(true)
		})
	})
	describe("Asset Transfer Transactions", () => {
		let assetTransferSchema: JSONSchemaType<AssetTransferTransaction>

		beforeAll(async () => {
			assetTransferSchema = JSON.parse(fs.readFileSync(path.resolve(__dirname, "schemas/axfer.transaction.json"), "utf8"))
		})
		it("(OK) Craft Asset Transfer transaction", async () => {
			// from algorand address
			const from: string = algoEncoder.encodeAddress(Buffer.from(transactionHeader.snd!))

			// create transfer transaction
			const txn: AssetTransferTransaction = withTestTransactionHeader(
				algorandCrafter
					.transferAsset(from, 1, from, 1)
					.addAssetCloseTo(from)
					.addAssetSender(from)
			).get()

			expect(txn).toBeDefined()
			expect(txn).toBeInstanceOf(AssetTransferTransaction)
			expect(txn).toEqual({
				type: "axfer",
				xaid: 1n,
				aamt: 1n,
				arcv: algoEncoder.decodeAddress(from),
				aclose: algoEncoder.decodeAddress(from),
				asnd: algoEncoder.decodeAddress(from),
				...transactionHeader,
			})

			const validate = ajv.compile(assetTransferSchema)
			expect(validate(txn)).toBe(true)
		})
	})
})
