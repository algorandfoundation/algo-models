import { AlgorandEncoder } from "./algorand.encoder"

export class AssetTransfer {
	type: string
    aamt: number | bigint
    arcv: Uint8Array
    fee: number
    fv: number
    lv: number
    snd: Uint8Array
    xaid: number
	gen: string
	gh: Uint8Array


	// encode the transaction
	// return the encoded transaction
	encode(): Uint8Array {
		const encoded: Uint8Array = new AlgorandEncoder().encodeTransaction(this)
		return encoded
	}
}

export interface IAssetTransferTxBuilder {
	addSender(sender: string): IAssetTransferTxBuilder
	addFee(fee: number): IAssetTransferTxBuilder


	get(): AssetTransfer
}

export class AssetTransferTxBuilder implements IAssetTransferTxBuilder {
	private tx: AssetTransfer

	constructor(genesisId: string, genesisHash: string, assetId: number, from: string, to: string, amount: number | bigint) {
		this.tx = new AssetTransfer()
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.gen = genesisId
		this.tx.type = "axfer"
		this.tx.fee = 1000
        this.tx.xaid = assetId
        this.tx.aamt = amount
        this.tx.snd = new AlgorandEncoder().decodeAddress(from)
        this.tx.arcv = new AlgorandEncoder().decodeAddress(to)
	}

	addSender(sender: string): IAssetTransferTxBuilder {
		this.tx.snd = new AlgorandEncoder().decodeAddress(sender)
		return this
	}

	addFee(fee: number): IAssetTransferTxBuilder {
		this.tx.fee = fee
		return this
	}

	addFirstValidRound(firstValid: number): IAssetTransferTxBuilder {
		this.tx.fv = firstValid
		return this
	}

	addLastValidRound(lastValid: number): IAssetTransferTxBuilder {
		this.tx.lv = lastValid
		return this
	}

    addReceiver(receiver: string): IAssetTransferTxBuilder {
        this.tx.arcv = new AlgorandEncoder().decodeAddress(receiver)
        return this
    }

	get(): AssetTransfer {
		return this.tx
	}
}
