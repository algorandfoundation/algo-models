import { sha512_256 } from "js-sha512"
import base32 from "hi-base32"
import { ALGORAND_ADDRESS_BAD_CHECKSUM_ERROR_MSG, AlgorandEncoder, MALFORMED_ADDRESS_ERROR_MSG } from "./algorand.encoder"
import * as msgpack from "algo-msgpack-with-bigint"
import { PayTransaction } from "./algorand.transaction.pay"
import { KeyregTransaction } from "./algorand.transaction.keyreg"
import { AlgorandTransactionCrafter } from "./algorand.transaction.crafter"
import { AssetParamsBuilder } from "./algorand.asset.params"
import { AssetConfigTransaction } from "./algorand.transaction.acfg"
import { AssetFreezeTransaction } from "./algorand.transaction.afrz"
import { AssetTransferTransaction } from "./algorand.transaction.axfer"
import algosdk from 'algosdk'
import { randomBytes } from "crypto"
import nacl from "tweetnacl"
import { SignedTransaction } from "./algorand.transaction"
import { TransactionHeader, ALGORAND_LEASE_LENGTH_ERROR_MSG } from "./algorand.transaction.header"

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

		const decodedSignedTransaction: SignedTransaction = algoEncoder.decodeSignedTransaction(signedTransaction)
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
				fv: 1000n,
				lv: 2000n,
				fee: 1000n,
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


		// Encoding of empty note vs no note should be the same
		const txn2: PayTransaction = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).addFee(1000).get()
		const txn3: PayTransaction = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).addNote("").addFee(1000).get()
		expect(txn2.encode()).toEqual(txn3.encode())

		// Encoding of 0 Algo amount vs no amount should be the same
		const txn4: PayTransaction = algorandCrafter.pay(0, from, to).addFirstValidRound(1000).addLastValidRound(2000).get()
		const txn5: PayTransaction = Object.assign(new PayTransaction(), txn4)
		delete (txn5 as any).amt // Explicitly delete amt field
		expect(txn4.encode()).toEqual(txn5.encode())

		// Encoding of 0 Algo fee vs no fee should be the same
		const txn6: PayTransaction = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).addFee(0).get()
		const txn7: PayTransaction = algorandCrafter.pay(1000, from, to).addFirstValidRound(1000).addLastValidRound(2000).get()
		delete (txn7 as any).fee // Fee is set to 1000n by default in constructor; so we explicitly delete it.
		expect(txn6.encode()).toEqual(txn7.encode())
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
		const metadataHash = randomBytes(32)
		const params = new AssetParamsBuilder()
			.addTotal(1)
			.addDecimals(1)
			.addDefaultFrozen(false)
			.addAssetName("Big Yeetus")
			.addUnitName("YEET")
			.addMetadataHash(metadataHash)
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

		expect(txn.encode()).toEqual(algoEncoder.encodeTransaction(txn))


		// Ensure that omitting addDefaultFrozen encodes into the same bytes as above
		const params2 = new AssetParamsBuilder()
			.addTotal(1)
			.addDecimals(1)
			.addAssetName("Big Yeetus")
			.addUnitName("YEET")
			.addMetadataHash(metadataHash)
			.addClawbackAddress(from)
			.addFreezeAddress(from)
			.addManagerAddress(from)
			.addReserveAddress(from)
			.get()

		// create keyreg transaction
		const txn2: AssetConfigTransaction = algorandCrafter
			.createAsset(from, params2)
			.addFirstValidRound(1000)
			.addLastValidRound(2000)
			.addNote(note, "base64")
			.addFee(1000)
			.addGroup(grp)
			.addRekey(from)
			.addLease(lx)
			.get()


		expect(txn.encode()).toEqual(txn2.encode())
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
		const keyPair = {
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

	it("(FAIL) validating lease - Bad length", async () => {
		const lease = new Uint8Array(31);

		expect(() => {
			TransactionHeader.validateLease(lease)
		}).toThrowError(ALGORAND_LEASE_LENGTH_ERROR_MSG)
	})

	describe("Transaction Groups", () => {
		it("(OK) Legacy AlgoSDK - Encoding of transaction group", async () => {
			const keyPair = {
				publicKey: Uint8Array.from([
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
				secretKey: Uint8Array.from([
					129, 128, 61, 158, 124, 215, 83, 137, 85, 47, 135, 151, 18, 162, 131, 63, 233, 138, 189, 56, 18, 114, 209, 4, 4, 128, 0, 159, 159, 76, 39, 85,
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
			}

			const sender: string = algoEncoder.encodeAddress(Buffer.from(keyPair.publicKey))

			const expectedTxn = new algosdk.Transaction({
				type: algosdk.TransactionType.pay,
				sender,
				paymentParams: {
					receiver:
						'UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM',
					amount: 847,
				},
				suggestedParams: {
					minFee: 1000,
					fee: 10,
					firstValid: 51,
					lastValid: 61,
					genesisHash: algosdk.base64ToBytes(
						'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI='
					),
					genesisID: 'mock-network',
				},
				note: new Uint8Array([123, 12, 200]),
			});

			expectedTxn.signTxn(keyPair.secretKey);

			expectedTxn.group = algosdk.computeGroupID([expectedTxn]);
			const encTxn = algosdk.encodeMsgpack(expectedTxn);
			const decTxn = algosdk.decodeMsgpack(encTxn, algosdk.Transaction);
			expect(decTxn).toEqual(expectedTxn);

			const encRep = expectedTxn.toEncodingData();
			const reencRep = decTxn.toEncodingData();
			expect(reencRep).toEqual(encRep);
		})

		it("(OK) Encoding of transaction group", async () => {
			const keyPair = {
				publicKey: Uint8Array.from([
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
				secretKey: Uint8Array.from([
					129, 128, 61, 158, 124, 215, 83, 137, 85, 47, 135, 151, 18, 162, 131, 63, 233, 138, 189, 56, 18, 114, 209, 4, 4, 128, 0, 159, 159, 76, 39, 85,
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
			}

			const sender: string = algoEncoder.encodeAddress(Buffer.from(keyPair.publicKey))
			const receiver: string = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM"
			const amount: number = 847
			const firstValidRound: number = 51
			const lastValidRound: number = 61
			const genesisHashStr: string = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI="
			const genesisID: string = "mock-network"
			const fee: number = 100000

			const crafter: AlgorandTransactionCrafter = new AlgorandTransactionCrafter(genesisID, genesisHashStr)

			// Build pay transaction
			const payTxn: PayTransaction = crafter.pay(amount, sender, receiver)
				.addFirstValidRound(firstValidRound)
				.addLastValidRound(lastValidRound)
				.addFee(fee)
				.addAmount(amount)
				.get()

			let modelsEncodedTx: Uint8Array = payTxn.encode()

			const expectedTxn = new algosdk.Transaction({
				type: algosdk.TransactionType.pay,
				sender,
				paymentParams: {
					receiver,
					amount,
				},
				suggestedParams: {
					minFee: 100,
					fee,
					flatFee: true,
					firstValid: firstValidRound,
					lastValid: lastValidRound,
					genesisHash: algosdk.base64ToBytes(
						genesisHashStr
					),
					genesisID,
				},
			});

			// algosdk sign
			expectedTxn.signTxn(keyPair.secretKey);

			// models sign
			const sig: Uint8Array = nacl.sign.detached(modelsEncodedTx, keyPair.secretKey)

			// attach sig
			const signedTxModels: Uint8Array = crafter.addSignature(modelsEncodedTx, sig)

			const bytesToSign: Uint8Array = expectedTxn.bytesToSign()
			expect(modelsEncodedTx).toEqual(bytesToSign)

			expectedTxn.group = algosdk.computeGroupID([expectedTxn]);

			// Compute correct group ID with models when signature is present on txns
			const modelsGroupId: Uint8Array = new AlgorandEncoder().computeGroupId([signedTxModels])
			expect(expectedTxn.group).toEqual(modelsGroupId)

			// Compute correct group ID with models when signature is NOT present on txns
			const modelsGroupId2: Uint8Array = new AlgorandEncoder().computeGroupId([modelsEncodedTx])
			expect(expectedTxn.group).toEqual(modelsGroupId2)
		})

		it("(OK) Encoding of transaction group with multiple transactions from different signers", async () => {
			const keyPair1 = {
				publicKey: Uint8Array.from([
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
				secretKey: Uint8Array.from([
					129, 128, 61, 158, 124, 215, 83, 137, 85, 47, 135, 151, 18, 162, 131, 63, 233, 138, 189, 56, 18, 114, 209, 4, 4, 128, 0, 159, 159, 76, 39, 85,
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 20,
				]),
			}

			const keyPair2 = {
				publicKey: Uint8Array.from([
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 21,
				]),
				secretKey: Uint8Array.from([
					129, 128, 61, 158, 124, 215, 83, 137, 85, 47, 135, 151, 18, 162, 131, 63, 233, 138, 189, 56, 18, 114, 209, 4, 4, 128, 0, 159, 159, 76, 39, 85,
					54, 40, 107, 229, 129, 45, 73, 38, 42, 70, 201, 214, 130, 182, 245, 154, 39, 250, 247, 34, 218, 97, 92, 98, 82, 0, 72, 242, 30, 197, 142, 21,
				]),
			}

			const sender1: string = algoEncoder.encodeAddress(Buffer.from(keyPair1.publicKey))
			const sender2: string = algoEncoder.encodeAddress(Buffer.from(keyPair2.publicKey))

			const receiver: string = "UCE2U2JC4O4ZR6W763GUQCG57HQCDZEUJY4J5I6VYY4HQZUJDF7AKZO5GM"
			const amount: number = 847
			const firstValidRound: number = 51
			const lastValidRound: number = 61
			const genesisHashStr: string = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI="
			const genesisID: string = "mock-network"
			const fee: number = 100000

			const crafter: AlgorandTransactionCrafter = new AlgorandTransactionCrafter(genesisID, genesisHashStr)

			// Build pay transaction
			const payTxn1: PayTransaction = crafter.pay(amount, sender1, receiver)
				.addFirstValidRound(firstValidRound)
				.addLastValidRound(lastValidRound)
				.addFee(fee)
				.addAmount(amount)
				.get()

			const payTxn2: PayTransaction = crafter.pay(amount, sender2, receiver)
				.addFirstValidRound(firstValidRound)
				.addLastValidRound(lastValidRound)
				.addFee(fee)
				.addAmount(amount)
				.get()

			// encode transactions
			const encodedTxn1: Uint8Array = payTxn1.encode()
			const encodedTxn2: Uint8Array = payTxn2.encode()

			// sign transactions
			const sig1: Uint8Array = nacl.sign.detached(encodedTxn1, keyPair1.secretKey)
			const sig2: Uint8Array = nacl.sign.detached(encodedTxn2, keyPair2.secretKey)

			// attach sigs
			const signedTxn1: Uint8Array = crafter.addSignature(encodedTxn1, sig1)
			const signedTxn2: Uint8Array = crafter.addSignature(encodedTxn2, sig2)

			// group transactions
			const group: Uint8Array = algoEncoder.computeGroupId([signedTxn1, signedTxn2])

			// create expected group
			const expectedGroup: Uint8Array = algoEncoder.computeGroupId([signedTxn1, signedTxn2])

			// match group ids
			expect(group).toEqual(expectedGroup)
		})
	})
})
