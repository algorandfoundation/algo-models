import { AlgorandEncoder } from "./algorand.encoder.js"
import { ITransactionHeaderBuilder, TransactionHeader } from "./algorand.transaction.header.js";

/**
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link PayTxBuilder}
 * @example // Manual
 * const txn = new PayTransaction()
 */
export class PayTransaction extends TransactionHeader {
	declare type: "pay"
	/**
	 * Receiver
	 *
	 * The address of the account that receives the amount.
	 */
	rcv: Uint8Array | undefined
	/**
	 * Amount
	 *
	 * The total amount to be sent in microAlgos.
	 */
	amt: bigint | undefined

	/**
	 * Close Remainder To
	 *
	 * When set, it indicates that the transaction is requesting that the Sender account should be closed,
	 * and all remaining funds, after the fee and amount are paid, be transferred to this address.
	 */
	close?: Uint8Array

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
export interface IPayTxBuilder extends ITransactionHeaderBuilder<IPayTxBuilder> {
	/**
	 * Add Receiver
	 *
	 * @param receiver The address of the account that receives the amount.
	 */
	addReceiver(receiver: string): IPayTxBuilder
	/**
	 * Add Amount
	 *
	 * @param amount The total amount to be sent in microAlgos.
	 */
	addAmount(amount: number | bigint): IPayTxBuilder
	/**
	 * Add Close Remainder To
	 *
	 * @param close Indicates that the transaction is requesting that the Sender account should be closed.
	 */
	addCloseTo(close: string): IPayTxBuilder
	get(): PayTransaction
}
/**
 * @category Builders
 */
export class PayTxBuilder implements IPayTxBuilder {
	private readonly tx: PayTransaction
	private readonly encoder: AlgorandEncoder

	constructor(genesisId: string, genesisHash: string) {
		this.encoder = new AlgorandEncoder()

		this.tx = new PayTransaction()
		this.tx.gen = genesisId
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.type = "pay"
		this.tx.fee = 1000n
	}
	addReceiver(receiver: string): IPayTxBuilder {
		this.tx.rcv = this.encoder.decodeAddress(receiver)
		return this
	}
	addAmount(amount: number | bigint): IPayTxBuilder {
		this.tx.amt = AlgorandEncoder.safeCastBigInt(amount)
		return this
	}
	addCloseTo(close: string): IPayTxBuilder {
		this.tx.close = this.encoder.decodeAddress(close)
		return this
	}
	addSender(sender: string): IPayTxBuilder {
		this.tx.snd = this.encoder.decodeAddress(sender)
		return this
	}
	addFee(fee: number | bigint): IPayTxBuilder {
		this.tx.fee = AlgorandEncoder.safeCastBigInt(fee)
		return this
	}
	addFirstValidRound(fv: number | bigint): IPayTxBuilder {
		this.tx.fv = AlgorandEncoder.safeCastBigInt(fv)
		return this
	}
	addLastValidRound(lv: number | bigint): IPayTxBuilder {
		this.tx.lv = AlgorandEncoder.safeCastBigInt(lv)
		return this
	}
	addNote(note: string, encoding: BufferEncoding = "utf8"): IPayTxBuilder {
		this.tx.note = AlgorandEncoder.readNoteField(note, encoding)
		return this
	}
	addRekey(rekey: string): IPayTxBuilder {
		this.tx.rekey = this.encoder.decodeAddress(rekey)
		return this
	}
	addLease(lx: Uint8Array): IPayTxBuilder {
		TransactionHeader.validateLease(lx)
		this.tx.lx = lx
		return this
	}
	addGroup(grp: Uint8Array): IPayTxBuilder {
		this.tx.grp = grp
		return this
	}
	get(): PayTransaction {
		return this.tx
	}
}
