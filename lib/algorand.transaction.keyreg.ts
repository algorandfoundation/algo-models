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
export interface IKeyregTxBuilder extends ITransactionHeaderBuilder<IKeyregTxBuilder>{
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
		this.tx.votefst = AlgorandEncoder.safeCastBigInt(voteFirst)
		return this
	}
	addVoteLast(voteLast: number | bigint): IKeyregTxBuilder {
		this.tx.votelst = AlgorandEncoder.safeCastBigInt(voteLast)
		return this
	}
	addVoteKeyDilution(voteKeyDilution: number | bigint): IKeyregTxBuilder {
		this.tx.votekd = AlgorandEncoder.safeCastBigInt(voteKeyDilution)
		return this
	}
	addNonParticipation(nonParticipation: boolean): IKeyregTxBuilder {
		this.tx.nonpart = nonParticipation
		return this
	}
	addSender(sender: string): IKeyregTxBuilder {
		this.tx.snd = this.encoder.decodeAddress(sender)
		return this
	}
	addFee(fee: number | bigint): IKeyregTxBuilder {
		this.tx.fee = AlgorandEncoder.safeCastBigInt(fee)
		return this
	}
	addFirstValidRound(fv: number | bigint): IKeyregTxBuilder {
		this.tx.fv = AlgorandEncoder.safeCastBigInt(fv)
		return this
	}
	addLastValidRound(lv: number | bigint): IKeyregTxBuilder {
		this.tx.lv = AlgorandEncoder.safeCastBigInt(lv)
		return this
	}
	addNote(note: string, encoding: BufferEncoding = "utf8"): IKeyregTxBuilder {
		this.tx.note = new Uint8Array(Buffer.from(note, encoding))
		return this
	}
	addRekey(rekey: string): IKeyregTxBuilder {
		this.tx.rekey = this.encoder.decodeAddress(rekey)
		return this
	}
	addLease(lx: Uint8Array): IKeyregTxBuilder {
		TransactionHeader.validateLease(lx)
		this.tx.lx = lx
		return this
	}
	addGroup(grp: Uint8Array): IKeyregTxBuilder {
		this.tx.grp = grp
		return this
	}
	get(): KeyregTransaction {
		return this.tx
	}
}
