import { AlgorandEncoder } from "./algorand.encoder.js";
import { ITransactionHeaderBuilder, TransactionHeader } from "./algorand.transaction.header.js";

/**
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link KeyregTxBuilder}
 * @example // Manual
 * const txn = new KeyregTransaction()
 */
export class KeyregTransaction extends TransactionHeader {
	declare type: "keyreg"
	/**
	 * Vote PublicKey
	 *
	 * The root participation public key.
	 */
	votekey?: Uint8Array
	/**
	 * Selection PublicKey
	 *
	 * The VRF public key.
	 */
	selkey?: Uint8Array
	/**
	 * State Proof PublicKey
	 *
	 * The 64 byte state proof public key commitment.
	 */
	sprfkey?: Uint8Array
	/**
	 * Vote First
	 *
	 * The first round that the participation key is valid. Not to be confused with the FirstValid round of the keyreg transaction.
	 */
	votefst?: bigint
	/**
	 * Vote Last
	 *
	 * The last round that the participation key is valid.
	 * Not to be confused with the LastValid round of the keyreg transaction.
	 */
	votelst?: bigint
	/**
	 * Vote Key Dilution
	 *
	 * This is the dilution for the 2-level participation key.
	 * It determines the interval (number of rounds) for generating new ephemeral keys.
	 */
	votekd?: bigint
	/**
	 * Nonparticipating
	 *
	 * All new Algorand accounts are participating by default.
	 * This means that they earn rewards.
	 * Mark an account nonparticipating by setting this value to true and this account will no longer earn rewards.
	 * It is unlikely that you will ever need to do this and exists mainly for economic-related functions on the network.
	 */
	nonpart?: boolean

	// encode the transaction
	// return the encoded transaction
	encode(): Uint8Array {
		return new AlgorandEncoder().encodeTransaction(this)
	}
}
/**
 * @category Builders
 * @internal
 */
export interface IKeyregTxBuilder extends ITransactionHeaderBuilder<IKeyregTxBuilder> {
	/**
	 * Add Participation PublicKey
	 *
	 * @param voteKey The root participation public key.
	 * @param encoding Buffer encoding
	 */
	addVoteKey(voteKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	/**
	 * Add VRF PublicKey
	 *
	 * @param selectionKey The VRF public key.
	 * @param encoding Buffer encoding
	 */
	addSelectionKey(selectionKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	/**
	 * Add State Proof PublicKey
	 *
	 * @param stateProofKey The 64 byte state proof public key commitment.
	 * @param encoding Buffer encoding
	 */
	addStateProofKey(stateProofKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	/**
	 * Add Vote First
	 *
	 * @param voteFirst The first round that the participation key is valid.
	 */
	addVoteFirst(voteFirst: number | bigint): IKeyregTxBuilder
	/**
	 * Add Vote Last
	 *
	 * @param voteLast The last round that the participation key is valid.
	 */
	addVoteLast(voteLast: number | bigint): IKeyregTxBuilder
	/**
	 * Add Dilution
	 *
	 * @param voteKeyDilution This is the dilution for the 2-level participation key.
	 */
	addVoteKeyDilution(voteKeyDilution: number | bigint): IKeyregTxBuilder
	/**
	 * Add Non-Participating
	 *
	 * All new Algorand accounts are participating by default.
	 *
	 * @param nonParticipation Mark an account nonparticipating by setting this value to true and this account will no longer earn rewards.
	 */
	addNonParticipation(nonParticipation: boolean): IKeyregTxBuilder
	get(): KeyregTransaction
}
/**
 * @category Builders
 */
export class KeyregTxBuilder implements IKeyregTxBuilder {
	private readonly tx: KeyregTransaction
	private readonly encoder: AlgorandEncoder

	constructor(genesisId: string, genesisHash: string) {
		this.encoder = new AlgorandEncoder()

		this.tx = new KeyregTransaction()
		this.tx.gen = genesisId
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.type = "keyreg"
		this.tx.fee = 1000n
	}
	addVoteKey(voteKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.votekey = new Uint8Array(Buffer.from(voteKey, encoding))
		return this
	}
	addSelectionKey(selectionKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.selkey = new Uint8Array(Buffer.from(selectionKey, encoding))
		return this
	}
	addStateProofKey(stateProofKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.sprfkey = new Uint8Array(Buffer.from(stateProofKey, encoding))
		return this
	}
	addVoteFirst(voteFirst: number | bigint): IKeyregTxBuilder {
		const safeCastVf = AlgorandEncoder.safeCastBigInt(voteFirst)
		if (safeCastVf !== 0n) { this.tx.votefst = safeCastVf }
		return this
	}
	addVoteLast(voteLast: number | bigint): IKeyregTxBuilder {
		const safeCastVl = AlgorandEncoder.safeCastBigInt(voteLast)
		if (safeCastVl !== 0n) { this.tx.votelst = safeCastVl }
		return this
	}
	addVoteKeyDilution(voteKeyDilution: number | bigint): IKeyregTxBuilder {
		const safeCastVkd = AlgorandEncoder.safeCastBigInt(voteKeyDilution)
		if (safeCastVkd !== 0n) { this.tx.votekd = safeCastVkd }
		return this
	}
	addNonParticipation(nonParticipation: boolean): IKeyregTxBuilder {
		if (nonParticipation) this.tx.nonpart = nonParticipation
		return this
	}
	addSender(sender: string): IKeyregTxBuilder {
		const decoded = this.encoder.decodeAddress(sender)
		if (!decoded.every(b => b === 0)) this.tx.snd = decoded
		return this
	}
	addFee(fee: number | bigint): IKeyregTxBuilder {
		const safeFee = AlgorandEncoder.safeCastBigInt(fee)
		if (safeFee !== 0n) { this.tx.fee = safeFee } else { delete this.tx.fee }
		return this
	}
	addFirstValidRound(fv: number | bigint): IKeyregTxBuilder {
		const safeCastFv = AlgorandEncoder.safeCastBigInt(fv)
		if (safeCastFv !== 0n) { this.tx.fv = safeCastFv }
		return this
	}
	addLastValidRound(lv: number | bigint): IKeyregTxBuilder {
		const safeCastLv = AlgorandEncoder.safeCastBigInt(lv)
		if (safeCastLv !== 0n) { this.tx.lv = safeCastLv }
		return this
	}
	addNote(note: string, encoding: BufferEncoding = "utf8"): IKeyregTxBuilder {
		const parsed = new Uint8Array(Buffer.from(note, encoding))
		if (parsed.length !== 0) { this.tx.note = parsed }
		return this
	}
	addRekey(address: string): IKeyregTxBuilder {
		this.tx.rekey = this.encoder.decodeAddress(address)
		return this
	}
	addLease(lease: Uint8Array): IKeyregTxBuilder {
		TransactionHeader.validateLease(lease)
		this.tx.lx = lease
		return this
	}
	addGroup(group: Uint8Array): IKeyregTxBuilder {
		this.tx.grp = group
		return this
	}
	get(): KeyregTransaction {
		return this.tx
	}
}
