import { AlgorandEncoder } from "./algorand.encoder.js";
import { ITransactionHeaderBuilder, TransactionHeader } from "./algorand.transaction.header.js";

/**
 * Includes all fields in {@link TransactionHeader} and "type" is "axfer".
 *
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link AssetFreezeTxBuilder}
 * @example // Manual
 * const txn = new AssetFreezeTransaction()
 */
export class AssetFreezeTransaction extends TransactionHeader {
    declare type: "afrz"
    /**
     * The address of the account whose asset is being frozen or unfrozen.
     */
    fadd: Uint8Array | undefined
    /**
     * The asset ID being frozen or unfrozen.
     */
    faid: bigint
    /**
     * True to freeze the asset.
     */
    afrz: boolean
    /**
     * Encode the {@link AssetFreezeTransaction}
     */
    encode(): Uint8Array {
        return new AlgorandEncoder().encodeTransaction(this)
    }
}
/**
 * Builder Interface for Asset Freeze Transaction
 * @category Builders
 * @internal
 */
export interface IAssetFreezeTxBuilder extends ITransactionHeaderBuilder<IAssetFreezeTxBuilder> {
    /**
     * Add Freeze Account
     *
     * @param fadd The address of the account whose asset is being frozen or unfrozen.
     */
    addFreezeAccount(fadd: string): IAssetFreezeTxBuilder
    /**
     * Add Freeze Asset ID
     *
     * @param faid The asset ID being frozen or unfrozen.
     */
    addFreezeAsset(faid: number | bigint): IAssetFreezeTxBuilder
    /**
     * Add Asset Frozen
     *
     * @param afrz True to freeze the asset.
     */
    addAssetFrozen(afrz: boolean): IAssetFreezeTxBuilder
    /**
     * Validate the model and return the instance
     */
    get(): AssetFreezeTransaction
}

/**
 * @category Builders
 */
export class AssetFreezeTxBuilder implements IAssetFreezeTxBuilder {
    private readonly tx: AssetFreezeTransaction
    private readonly encoder: AlgorandEncoder

    constructor(genesisId: string, genesisHash: string) {
        this.encoder = new AlgorandEncoder()

        this.tx = new AssetFreezeTransaction()
        this.tx.gen = genesisId
        this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
        this.tx.type = "afrz"
        this.tx.fee = 1000n
    }
    addFreezeAccount(fadd: string): IAssetFreezeTxBuilder {
        this.tx.fadd = this.encoder.decodeAddress(fadd)
        return this
    }
    addFreezeAsset(faid: number | bigint): IAssetFreezeTxBuilder {
        this.tx.faid = AlgorandEncoder.safeCastBigInt(faid)!
        return this
    }
    addAssetFrozen(afrz: boolean): IAssetFreezeTxBuilder {
        this.tx.afrz = afrz
        return this
    }
    addSender(sender: string): IAssetFreezeTxBuilder {
        this.tx.snd = this.encoder.decodeAddress(sender)
        return this
    }
    addFee(fee: number | bigint): IAssetFreezeTxBuilder {
        this.tx.fee = AlgorandEncoder.safeCastBigInt(fee)
        return this
    }
    addFirstValidRound(firstValid: number | bigint): IAssetFreezeTxBuilder {
        this.tx.fv = AlgorandEncoder.safeCastBigInt(firstValid)
        return this
    }
    addLastValidRound(lastValid: number | bigint): IAssetFreezeTxBuilder {
        this.tx.lv = AlgorandEncoder.safeCastBigInt(lastValid)
        return this
    }
    addNote(note: string, encoding: BufferEncoding = "utf8"): IAssetFreezeTxBuilder {
        this.tx.note = AlgorandEncoder.readNoteField(note, encoding)
        return this
    }
    addRekey(address: string): IAssetFreezeTxBuilder {
        this.tx.rekey = this.encoder.decodeAddress(address)
        return this
    }
    addLease(lease: Uint8Array): IAssetFreezeTxBuilder {
        TransactionHeader.validateLease(lease)
        this.tx.lx = lease
        return this
    }
    addGroup(group: Uint8Array): IAssetFreezeTxBuilder {
        this.tx.grp = group
        return this
    }
    get(): AssetFreezeTransaction {
        return this.tx
    }
}
