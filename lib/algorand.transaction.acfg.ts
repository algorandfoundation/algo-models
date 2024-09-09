import {AlgorandEncoder} from "./algorand.encoder.js"
import {AssetParams} from "./algorand.asset.params.js";
import {ITransactionHeaderBuilder, TransactionHeader} from "./algorand.transaction.js";

/**
 * This is used to create, configure and destroy an asset depending on which fields are set.
 *
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link AssetConfigTxBuilder}
 * @example // Manual
 * const txn = new AssetConfigTransaction()
 */
export class AssetConfigTransaction extends TransactionHeader {
    declare type: "acfg"
    /**
     * For re-configure or destroy transactions, this is the unique asset ID. On asset creation, the ID is set to zero.
     * @type {number | bigint}
     */
    caid?: number | bigint
    /**
     * See {@link AssetParams} for all available fields.
     * @type {AssetParams}
     */
    apar?: AssetParams
    /**
     * Encode the {@link AssetConfigTransaction}
     */
    encode(): Uint8Array {
        return new AlgorandEncoder().encodeTransaction(this)
    }
}
/**
 * Builder Interface for Asset Config Transaction
 * @category Builders
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link AssetConfigTxBuilder}
 * @internal
 */
export interface IAssetConfigTxBuilder extends ITransactionHeaderBuilder<IAssetConfigTxBuilder>{
    /**
     * Add Asset ID
     *
     * @remarks required, except on create
     * @param caid For re-configure or destroy transactions, this is the unique asset ID. On asset creation, the ID is set to zero.
     */
    addAssetId(caid: number | bigint): IAssetConfigTxBuilder
    /**
     * Add Asset Parameters
     *
     * @remarks required, except on destroy
     * @param params
     */
    addAssetParams(params: AssetParams): IAssetConfigTxBuilder
    /**
     * Validate the model and return the instance
     */
    get(): AssetConfigTransaction
}
/**
 * This is used to create, configure and destroy an asset depending on which fields are set.
 *
 * @category Builders
 * @see {@link AlgorandTransactionCrafter}
 * @example // Builder
 * const tx = new AssetConfigTxBuilder("GENESIS_ID", "GENESIS_HASH")
 *          .addAssetId(1234)
 *          .get()
 */
export class AssetConfigTxBuilder implements IAssetConfigTxBuilder {
    private readonly tx: AssetConfigTransaction
    private readonly encoder: AlgorandEncoder

    constructor(genesisId: string, genesisHash: string) {
        this.encoder = new AlgorandEncoder()

        this.tx = new AssetConfigTransaction()
        this.tx.gen = genesisId
        this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
        this.tx.type = "acfg"
        this.tx.fee = 1000
    }
    addAssetId(caid: number | bigint): IAssetConfigTxBuilder {
        this.tx.caid = caid
        return this
    }
    addAssetParams(params: AssetParams): IAssetConfigTxBuilder{
        this.tx.apar = params
        return this
    }
    addSender(sender: string): IAssetConfigTxBuilder {
        this.tx.snd = this.encoder.decodeAddress(sender)
        return this
    }
    addFee(fee: number): IAssetConfigTxBuilder {
        this.tx.fee = fee
        return this
    }
    addFirstValidRound(fv: number): IAssetConfigTxBuilder {
        this.tx.fv = fv
        return this
    }
    addLastValidRound(lv: number): IAssetConfigTxBuilder {
        this.tx.lv = lv
        return this
    }
    addNote(note: string, encoding: BufferEncoding = "utf8"): IAssetConfigTxBuilder {
        this.tx.note = new Uint8Array(Buffer.from(note, encoding))
        return this
    }
    addRekey(rekey: string): IAssetConfigTxBuilder {
        this.tx.rekey = this.encoder.decodeAddress(rekey)
        return this
    }
    addLease(lx: Uint8Array): IAssetConfigTxBuilder {
        this.tx.lx = lx
        return this
    }
    addGroup(grp: Uint8Array): IAssetConfigTxBuilder {
        this.tx.grp = grp
        return this
    }
    get(): AssetConfigTransaction {
        return this.tx
    }
}
