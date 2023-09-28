import { AlgorandEncoder } from "./algorand.encoder.js"

export class KeyregTransaction {
	type: string
	snd: Uint8Array
	fee: number
	fv: number
	lv: number
	note?: Uint8Array
	votekey?: Uint8Array
	selkey?: Uint8Array
	sprfkey?: Uint8Array
	votefst?: number
	votelst?: number
	votekd?: number
	nonpart?: boolean
	gen: string
	gh: Uint8Array

	// encode the transaction
	// return the encoded transaction
	encode(): Uint8Array {
		// delete optional fields if undefined
		if (this.note === undefined) {
			delete this.note
		}
		if (this.votekey === undefined) {
			delete this.votekey
		}
		if (this.selkey === undefined) {
			delete this.selkey
		}
		if (this.sprfkey === undefined) {
			delete this.sprfkey
		}
		if (this.votefst === undefined) {
			delete this.votefst
		}
		if (this.votelst === undefined) {
			delete this.votelst
		}
		if (this.votekd === undefined) {
			delete this.votekd
		}
		if (this.nonpart === undefined) {
			delete this.nonpart
		}
		const encoded: Uint8Array = new AlgorandEncoder().encodeTransaction(this)
		return encoded
	}
}

export interface IKeyregTxBuilder {
	addSender(sender: string): IKeyregTxBuilder
	addFee(fee: number): IKeyregTxBuilder
	addFirstValidRound(firstValid: number): IKeyregTxBuilder
	addLastValidRound(lastValid: number): IKeyregTxBuilder
	addNote(note: string, encoding?: BufferEncoding): IKeyregTxBuilder
	addVoteKey(voteKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	addSelectionKey(selectionKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	addStateProofKey(stateProofKey: string, encoding?: BufferEncoding): IKeyregTxBuilder
	addVoteFirst(voteFirst: number): IKeyregTxBuilder
	addVoteLast(voteLast: number): IKeyregTxBuilder
	addVoteKeyDilution(voteKeyDilution: number): IKeyregTxBuilder
	addNonParticipation(nonParticipation: boolean): IKeyregTxBuilder
	get(): KeyregTransaction
}

export class KeyregTxBuilder implements IKeyregTxBuilder {
	private tx: KeyregTransaction

	constructor(genesisHash: string) {
		this.tx = new KeyregTransaction()
		//this.tx.gen = genesisId
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.type = "keyreg"
		this.tx.fee = 1000
	}

	addSender(sender: string): IKeyregTxBuilder {
		this.tx.snd = new AlgorandEncoder().decodeAddress(sender)
		return this
	}

	addFee(fee: number): IKeyregTxBuilder {
		this.tx.fee = fee
		return this
	}

	addFirstValidRound(firstValid: number): IKeyregTxBuilder {
		this.tx.fv = firstValid
		return this
	}

	addLastValidRound(lastValid: number): IKeyregTxBuilder {
		this.tx.lv = lastValid
		return this
	}

	addNote(note: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.note = Buffer.from(note, encoding)
		return this
	}

	addVoteKey(voteKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.votekey = Buffer.from(voteKey, encoding)
		return this
	}

	addSelectionKey(selectionKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.selkey = Buffer.from(selectionKey, encoding)
		return this
	}

	addStateProofKey(stateProofKey: string, encoding: BufferEncoding = "base64"): IKeyregTxBuilder {
		this.tx.sprfkey = Buffer.from(stateProofKey, encoding)
		return this
	}

	addVoteFirst(voteFirst: number): IKeyregTxBuilder {
		this.tx.votefst = voteFirst
		return this
	}

	addVoteLast(voteLast: number): IKeyregTxBuilder {
		this.tx.votelst = voteLast
		return this
	}

	addVoteKeyDilution(voteKeyDilution: number): IKeyregTxBuilder {
		this.tx.votekd = voteKeyDilution
		return this
	}

	addNonParticipation(nonParticipation: boolean): IKeyregTxBuilder {
		this.tx.nonpart = nonParticipation
		return this
	}

	get(): KeyregTransaction {
		return this.tx
	}
}
