import {AlgorandEncoder} from "./algorand.encoder.js"
import {ITransactionHeaderBuilder, TransactionHeader} from "./algorand.transaction.header.js";

/**
 * Asset Transfer Transaction
 *
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link AssetFreezeTxBuilder}
 */
export class AssetTransferTransaction extends TransactionHeader {
    /**
     * Transfer Asset
     *
     * The unique ID of the asset to be transferred.
     */
    xaid: number | bigint
    /**
     * Asset Amount
     *
     * The amount of the asset to be transferred.
     * A zero amount transferred to self allocates that asset in the account's Asset map.
     */
    aamt: number | bigint
    /**
     * Asset Sender
     *
     * The sender of the transfer. The regular sender field should be used and this one set to the zero
     * value for regular transfers between accounts. If this value is nonzero, it indicates a clawback
     * transaction where the sender is the asset's clawback address and the asset sender is the address
     * from which the funds will be withdrawn.
     */
    asnd?: Uint8Array
    /**
     * Asset Receiver
     *
     * The recipient of the asset transfer.
     */
    arcv: Uint8Array
    /**
     * Specify this field to remove the asset holding from the sender account and reduce the account's
     * minimum balance (i.e. opt-out of the asset).
     */
    aclose?: Uint8Array

    encode(): Uint8Array {
        return new AlgorandEncoder().encodeTransaction(this)
    }
}
/**
 * Builder Interface for Asset Transfer Transaction
 * @category Builders
 * @internal
 */
export interface IAssetTransferTxBuilder extends ITransactionHeaderBuilder<IAssetTransferTxBuilder>{
    /**
     * Add Asset ID
     *
     * @param xaid The unique ID of the asset to be transferred.
     */
    addAssetId(xaid: number | bigint): IAssetTransferTxBuilder
    /**
     * Add Asset Amount
     *
     * @param aamt The amount of the asset to be transferred.
     */
    addAssetAmount(aamt: number | bigint): IAssetTransferTxBuilder
    /**
     * Add Asset Receiver
     *
     * @param arcv The recipient of the asset transfer.
     */
    addAssetReceiver(arcv: string): IAssetTransferTxBuilder
    /**
     * Add Asset Close To
     *
     * @param aclose Specify this field to remove the asset holding from the sender account.
     */
    addAssetCloseTo(aclose: string): IAssetTransferTxBuilder
    /**
     * Add Asset Sender
     *
     * @param asnd This should usually be undefined. It indicates a clawback transaction where the sender is the
     * asset's clawback address and the asset sender is the address from which the funds will be withdrawn.
     */
    addAssetSender(asnd: string): IAssetTransferTxBuilder
    // Getter
    get(): AssetTransferTransaction
}

/**
 * Asset Transfer Transaction Builder
 * @category Builders
 */
export class AssetTransferTxBuilder implements IAssetTransferTxBuilder {
    private readonly tx: AssetTransferTransaction
    private readonly encoder: AlgorandEncoder

    constructor(genesisId: string, genesisHash: string) {
        this.encoder = new AlgorandEncoder()

        this.tx = new AssetTransferTransaction()
        this.tx.gen = genesisId
        this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"))
        this.tx.type = "axfer"
        this.tx.fee = 1000n
    }
    addAssetId(xaid: number | bigint): IAssetTransferTxBuilder {
        this.tx.xaid = AlgorandEncoder.safeCastBigInt(xaid)
        return this
    }
    addAssetAmount(aamt: number | bigint): IAssetTransferTxBuilder {
        if(BigInt(aamt)  !== 0n) {
            this.tx.aamt = AlgorandEncoder.safeCastBigInt(aamt)
        }
        return this
    }
    addAssetSender(asnd: string): IAssetTransferTxBuilder {
        this.tx.asnd = this.encoder.decodeAddress(asnd)
        return this
    }
    addAssetReceiver(arcv: string): IAssetTransferTxBuilder {
        this.tx.arcv = this.encoder.decodeAddress(arcv)
        return this
    }
    addAssetCloseTo(aclose: string): IAssetTransferTxBuilder {
        this.tx.aclose = this.encoder.decodeAddress(aclose)
        return this
    }
    addSender(sender: string): IAssetTransferTxBuilder {
        this.tx.snd = this.encoder.decodeAddress(sender)
        return this
    }
    addFee(fee: number | bigint): IAssetTransferTxBuilder {
        this.tx.fee = AlgorandEncoder.safeCastBigInt(fee)
        return this
    }
    addFirstValidRound(firstValid: number | bigint): IAssetTransferTxBuilder {
        this.tx.fv = AlgorandEncoder.safeCastBigInt(firstValid)
        return this
    }
    addLastValidRound(lastValid: number | bigint): IAssetTransferTxBuilder {
        this.tx.lv = AlgorandEncoder.safeCastBigInt(lastValid)
        return this
    }
    addNote(note: string, encoding: BufferEncoding = "utf8"): IAssetTransferTxBuilder {
        this.tx.note = new Uint8Array(Buffer.from(note, encoding))
        return this
    }
    addRekey(address: string): IAssetTransferTxBuilder {
        this.tx.rekey = this.encoder.decodeAddress(address)
        return this
    }
    addLease(lease: Uint8Array): IAssetTransferTxBuilder {
        this.tx.lx = lease
        return this
    }
    addGroup(group: Uint8Array): IAssetTransferTxBuilder {
        this.tx.grp = group
        return this
    }
    get(): AssetTransferTransaction {
        return this.tx
    }
}
