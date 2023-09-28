import { Crafter } from "./crafter.role.js"
import { AlgorandEncoder } from "./algorand.encoder.js"
import { type IPayTxBuilder, PayTxBuilder } from "./algorand.transaction.pay.js"
import { type IKeyregTxBuilder, KeyregTxBuilder } from "./algorand.transaction.keyreg.js"
import * as msgpack from "algo-msgpack-with-bigint"

export class AlgorandTransactionCrafter extends Crafter {

	constructor(private readonly genesisId: string, private readonly genesisHash: string) {
		super()
	}

	/**
	 *
	 * @param amount
	 * @param from
	 * @param to
	 * @returns
	 */
	pay(amount: number, from: string, to: string): IPayTxBuilder {
		return new PayTxBuilder(this.genesisId, this.genesisHash).addAmount(amount).addSender(from).addReceiver(to)
	}

	/**
	 *
	 * @param from
	 * @param voteKey
	 * @param selectionKey
	 * @param stateProofKey
	 * @param voteFirst
	 * @param voteLast
	 * @param voteKeyDilution
	 * @returns
	 */
	changeOnline(from: string, voteKey: string, selectionKey: string, stateProofKey: string, voteFirst: number, voteLast: number, voteKeyDilution: number): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisHash)
			.addSender(from)
			.addVoteKey(voteKey)
			.addSelectionKey(selectionKey)
			.addStateProofKey(stateProofKey)
			.addVoteFirst(voteFirst)
			.addVoteLast(voteLast)
			.addVoteKeyDilution(voteKeyDilution)
	}

	/**
	 *
	 * @param from
	 * @returns
	 */
	changeOffline(from: string): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisHash)
			.addSender(from)
	}

	/**
	 *
	 * @param from
	 * @returns
	 */
	markNonParticipation(from: string): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisHash)
			.addSender(from)
			.addNonParticipation(true)
	}

	/**
	 *
	 * @param encodedTransaction
	 * @param signature
	 * @returns
	 */
	addSignature(encodedTransaction: Uint8Array, signature: Uint8Array): Uint8Array {
		// remove TAG prefix
		const txObj = new AlgorandEncoder().decodeTransaction(encodedTransaction)

		const signedTx = {
			sig: signature,
			txn: txObj,
		}

		// Encode without TAG
		return msgpack.encode(signedTx, { sortKeys: true })
	}
}
