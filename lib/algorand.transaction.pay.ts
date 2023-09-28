import { AlgorandEncoder } from "./algorand.encoder.js"

export class PayTransaction {
	type: string
	snd: Uint8Array
	rcv: Uint8Array
	amt: number
	fee: number
	fv: number
	lv: number
	note?: Uint8Array
	gen: string
	gh: Uint8Array

	// encode the transaction
	// return the encoded transaction
	encode(): Uint8Array {
		const encoded: Uint8Array = new AlgorandEncoder().encodeTransaction(this)
		return encoded
	}
}

export interface IPayTxBuilder {
	addSender(sender: string): IPayTxBuilder
	addReceiver(receiver: string): IPayTxBuilder
	addAmount(amount: number): IPayTxBuilder
	addFee(fee: number): IPayTxBuilder
	addFirstValidRound(firstValid: number): IPayTxBuilder
	addLastValidRound(lastValid: number): IPayTxBuilder
	addNote(note: string, encoding?: BufferEncoding): IPayTxBuilder

	get(): PayTransaction
}

export class PayTxBuilder implements IPayTxBuilder {
	private tx: PayTransaction

	constructor(genesisId: string, genesisHash: string) {
		this.tx = new PayTransaction()
		this.tx.gen = genesisId
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.type = "pay"
		this.tx.fee = 1000
	}

	addSender(sender: string): IPayTxBuilder {
		this.tx.snd = new AlgorandEncoder().decodeAddress(sender)
		return this
	}

	addReceiver(receiver: string): IPayTxBuilder {
		this.tx.rcv = new AlgorandEncoder().decodeAddress(receiver)
		return this
	}

	addAmount(amount: number): IPayTxBuilder {
		this.tx.amt = amount
		return this
	}

	addFee(fee: number): IPayTxBuilder {
		this.tx.fee = fee
		return this
	}

	addFirstValidRound(firstValid: number): IPayTxBuilder {
		this.tx.fv = firstValid
		return this
	}

	addLastValidRound(lastValid: number): IPayTxBuilder {
		this.tx.lv = lastValid
		return this
	}

	addNote(note: string, encoding: BufferEncoding = "base64"): IPayTxBuilder {
		this.tx.note = Buffer.from(note, encoding)
		return this
	}

	get(): PayTransaction {
		return this.tx
	}
}
