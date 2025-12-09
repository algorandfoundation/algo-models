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
	rcv?: Uint8Array
	/**
	 * Amount
	 *
	 * The total amount to be sent in microAlgos.
	 */
	amt?: bigint

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
		const safeCastAmount = AlgorandEncoder.safeCastBigInt(amount)
		if (safeCastAmount !== 0n) { this.tx.amt = safeCastAmount }
		return this
	}
	addCloseTo(close: string): IPayTxBuilder {
		const decodedClose = this.encoder.decodeAddress(close)
		if (!decodedClose.every(b => b === 0)) { this.tx.close = decodedClose }
		return this
	}
	addSender(sender: string): IPayTxBuilder {
		const decodedSender = this.encoder.decodeAddress(sender)
		if (!decodedSender.every(b => b === 0)) { this.tx.snd = decodedSender }
		return this
	}
	addFee(fee: number | bigint): IPayTxBuilder {
		const safeCastFee = AlgorandEncoder.safeCastBigInt(fee)
		if (safeCastFee !== 0n) { this.tx.fee = safeCastFee } else { delete this.tx.fee }
		return this
	}
	addFirstValidRound(fv: number | bigint): IPayTxBuilder {
		const safeCastFv = AlgorandEncoder.safeCastBigInt(fv)
		if (safeCastFv !== 0n) { this.tx.fv = safeCastFv }
		return this
	}
	addLastValidRound(lv: number | bigint): IPayTxBuilder {
		const safeCastLv = AlgorandEncoder.safeCastBigInt(lv)
		if (safeCastLv !== 0n) { this.tx.lv = safeCastLv }
		return this
	}
	addNote(note: string, encoding: BufferEncoding = "utf8"): IPayTxBuilder {
		const parsed = new Uint8Array(Buffer.from(note, encoding))
		if (parsed.length !== 0) { this.tx.note = parsed }
		return this
	}
	addRekey(rekey: string): IPayTxBuilder {
		const decodedRekey = this.encoder.decodeAddress(rekey)
		if (!decodedRekey.every(b => b === 0)) { this.tx.rekey = decodedRekey }
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
