import { AlgorandEncoder } from "./algorand.encoder.js";
import { AssetParams } from "./algorand.asset.params.js";
import { ITransactionHeaderBuilder, TransactionHeader } from "./algorand.transaction.header.js";

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
     * @type {bigint}
     */
    caid?: bigint
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
export interface IAssetConfigTxBuilder extends ITransactionHeaderBuilder<IAssetConfigTxBuilder> {
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
        this.tx.fee = 1000n
    }
    addAssetId(caid: number | bigint): IAssetConfigTxBuilder {
        const safeCastCaid = AlgorandEncoder.safeCastBigInt(caid)
        if (safeCastCaid !== 0n) { this.tx.caid = safeCastCaid }
        return this
    }
    addAssetParams(params: AssetParams): IAssetConfigTxBuilder {
        this.tx.apar = params
        return this
    }
    addSender(sender: string): IAssetConfigTxBuilder {
        const decoded = this.encoder.decodeAddress(sender)
        if (!decoded.every(b => b === 0)) this.tx.snd = decoded
        return this
    }
    addFee(fee: number | bigint): IAssetConfigTxBuilder {
        const safeFee = AlgorandEncoder.safeCastBigInt(fee)
        if (safeFee !== 0n) { this.tx.fee = safeFee } else { delete this.tx.fee }
        return this
    }
    addFirstValidRound(fv: number | bigint): IAssetConfigTxBuilder {
        const safeCastFv = AlgorandEncoder.safeCastBigInt(fv)
        if (safeCastFv !== 0n) { this.tx.fv = safeCastFv }
        return this
    }
    addLastValidRound(lv: number | bigint): IAssetConfigTxBuilder {
        const safeCastLv = AlgorandEncoder.safeCastBigInt(lv)
        if (safeCastLv !== 0n) { this.tx.lv = safeCastLv }
        return this
    }
    addNote(note: string, encoding: BufferEncoding = "utf8"): IAssetConfigTxBuilder {
        const parsed = new Uint8Array(Buffer.from(note, encoding))
        if (parsed.length !== 0) { this.tx.note = parsed }
        return this
    }
    addRekey(rekey: string): IAssetConfigTxBuilder {
        const decodedRekey = this.encoder.decodeAddress(rekey)
        if (!decodedRekey.every(b => b === 0)) { this.tx.rekey = decodedRekey }
        return this
    }
    addLease(lx: Uint8Array): IAssetConfigTxBuilder {
        TransactionHeader.validateLease(lx)
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
