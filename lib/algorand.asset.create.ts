import { AlgorandEncoder } from "./algorand.encoder"

export class AssetCreate {
	type: string
	snd: Uint8Array
	fee: number
	fv: number
	lv: number
	gen: string
	gh: Uint8Array

	apar: {
		dc: bigint
		t: number
		df?: boolean
		am?: Uint8Array
		an?: string
		au?: string
		c?: Uint8Array
		f?: Uint8Array
		m?: Uint8Array
		r?: Uint8Array
		un?: string
	}

	// encode the transaction
	// return the encoded transaction
	encode(): Uint8Array {
		const encoded: Uint8Array = new AlgorandEncoder().encodeTransaction(this)
		return encoded
	}
}

export interface IAssetCreateTxBuilder {
	addSender(sender: string): IAssetCreateTxBuilder
	addFee(fee: number): IAssetCreateTxBuilder
	addFirstValidRound(firstValid: number): IAssetCreateTxBuilder
	addLastValidRound(lastValid: number): IAssetCreateTxBuilder
	addUrl(url: string): IAssetCreateTxBuilder
	addName(name: string): IAssetCreateTxBuilder
	addUnit(unit: string): IAssetCreateTxBuilder
	addManagerAddress(manager: string): IAssetCreateTxBuilder
	addReserveAddress(reserve: string): IAssetCreateTxBuilder
	addFreezeAddress(freeze: string): IAssetCreateTxBuilder
	addClawbackAddress(clawback: string): IAssetCreateTxBuilder

	get(): AssetCreate
}

export class AssetCreateTxBuilder implements IAssetCreateTxBuilder {
	private tx: AssetCreate

	constructor(genesisId: string, genesisHash: string, decimals: bigint, totalTokens: number, defaultFreeze: boolean = false) {
		this.tx = new AssetCreate()
		this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
		this.tx.gen = genesisId
		this.tx.type = "acfg"
		this.tx.fee = 1000
		this.tx.apar = {
			dc: decimals,
			t: totalTokens
		}

		defaultFreeze ? this.tx.apar.df = defaultFreeze : null
	}

	addSender(sender: string): IAssetCreateTxBuilder {
		this.tx.snd = new AlgorandEncoder().decodeAddress(sender)
		return this
	}

	addFee(fee: number): IAssetCreateTxBuilder {
		this.tx.fee = fee
		return this
	}

	addFirstValidRound(firstValid: number): IAssetCreateTxBuilder {
		this.tx.fv = firstValid
		return this
	}

	addLastValidRound(lastValid: number): IAssetCreateTxBuilder {
		this.tx.lv = lastValid
		return this
	}

	addUrl(url: string): IAssetCreateTxBuilder {
		this.tx.apar.au = url
		return this
	}

	addName(name: string): IAssetCreateTxBuilder {
		this.tx.apar.an = name
		return this
	}

	addUnit(unit: string): IAssetCreateTxBuilder {
		this.tx.apar.un = unit
		return this
	}

	addManagerAddress(manager: string): IAssetCreateTxBuilder {
		this.tx.apar.m = new AlgorandEncoder().decodeAddress(manager)
		return this
	}

	addReserveAddress(reserve: string): IAssetCreateTxBuilder {
		this.tx.apar.r = new AlgorandEncoder().decodeAddress(reserve)
		return this
	}

	addFreezeAddress(freeze: string): IAssetCreateTxBuilder {
		this.tx.apar.f = new AlgorandEncoder().decodeAddress(freeze)
		return this
	}

	addClawbackAddress(clawback: string): IAssetCreateTxBuilder {
		this.tx.apar.c = new AlgorandEncoder().decodeAddress(clawback)
		return this
	}

	get(): AssetCreate {
		return this.tx
	}
}
