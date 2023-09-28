import { randomBytes } from "tweetnacl"
import { AlgorandEncoder } from "./algorand.encoder"
import * as msgpack from "algo-msgpack-with-bigint"
import { AlgorandTransactionCrafter } from "./algorand.transaction.crafter"

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
	let algorandCrafter: AlgorandTransactionCrafter

	const genesisId: string = "GENESIS_ID"
	// genesis in base64
	const genesisHash: string = Buffer.from(randomBytes(32)).toString("base64")

	beforeEach(async () => {
		algorandCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
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
})
