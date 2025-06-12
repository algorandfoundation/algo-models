import {AlgorandEncoder} from "./algorand.encoder.js"
import {ITransactionHeaderBuilder, TransactionHeader} from "./algorand.transaction.header";

/**
 * Represents the schema of the state used within an application.
 *
 * @category Common
 * @since v1.0.0
 */
export type StateSchema = {
    /**
     * Maximum number of integer values that may be stored in
     * the [global || local] application key/value store.
     *
     * Immutable.
     */
    nui: number
    /**
     * Maximum number of byte slices values that may be stored in
     * the [global || local] application key/value store.
     *
     * Immutable.
     */
    nbs: number
}

/**
 * Includes all fields in {@link TransactionHeader} and "type" is "appl".
 *
 * @category Transactions
 * @see {@link AlgorandTransactionCrafter}
 * @see {@link ApplicationCallTxBuilder}
 * @since v1.0.0
 */
export class ApplicationCallTransaction extends TransactionHeader {
    declare type: "appl"
    /**
     * Application ID
     *
     * ID of the application being configured or empty if creating.
     */
    apid: bigint // Application id (required)
    /**
     * OnComplete
     *
     * Defines what additional actions occur with the transaction.
     *
     * An application transaction must indicate the action to be taken following the execution of its approvalProgram or clearStateProgram.
     * The constants below describe the available actions.
     *
     * | Value | Name | Description |
     * |-------|------|-------------|
     * | 0 | NoOp | Only execute the ApprovalProgram associated with this application ID, with no additional effects. |
     * | 1 | OptIn | Before executing the ApprovalProgram, allocate the local state for this application into the sender's account data. |
     * | 2 | CloseOut | After executing the ApprovalProgram, clear any local state for this application out of the sender's account data. |
     * | 3 | ClearState | Don't execute the ApprovalProgram, and instead execute the ClearStateProgram (which may not reject this transaction). Additionally, clear any local state for this application out of the sender's account data as in CloseOutOC. |
     * | 4 | UpdateApplication | After executing the ApprovalProgram, replace the ApprovalProgram and ClearStateProgram associated with this application ID with the programs specified in this transaction. |
     * | 5 | DeleteApplication | After executing the ApprovalProgram, delete the application parameters from the account data of the application's creator. |
     */
    apan: number // #onComplete (required)
    /**
     * Accounts
     *
     * List of accounts in addition to the sender that may be accessed from the
     * application's approval-program and clear-state-program.
     */
    apat?: Uint8Array[] // Accounts
    /**
     * Approval Program
     *
     * Logic executed for every application transaction, except when on-completion is set to "clear".
     * It can read and write global state for the application, as well as account-specific local state.
     * Approval programs may reject the transaction.
     */
    apap?: Uint8Array // Approval program
    /**
     * App Arguments
     *
     * Transaction-specific arguments accessed from the application's approval-program and clear-state-program.
     */
    apaa?: Uint8Array[] // Application arguments
    /**
     * Clear State Program
     *
     * Logic executed for application transactions with on-completion set to "clear".
     * It can read and write global state for the application, as well as account-specific local state.
     * Clear state programs cannot reject the transaction.
     */
    apsu?: Uint8Array // Clear state program
    /**
     * Foreign Apps
     *
     * Lists the applications in addition to the application-id whose global states may
     * be accessed by this application's approval-program and clear-state-program.
     * The access is read-only.
     */
    apfa?: bigint[] // Foreign apps (check)
    /**
     * Foreign Assets
     *
     * Lists the assets whose AssetParams may be accessed by this application's approval-program and clear-state-program. The access is read-only.
     */
    apas?: bigint[] // Foreign assets (check)
    /**
     * Global {@link StateSchema}
     *
     * Holds the maximum number of global state values defined within a {@link StateSchema} object.
     */
    apgs?: StateSchema; // Global schema
    /**
     * Local {@link StateSchema}
     *
     * Holds the maximum number of local state values defined within a {@link StateSchema} object.
     */
    apls?: StateSchema; // Local schema
    /**
     *  Extra Program Pages
     *
     * Number of additional pages allocated to the application's approval and clear state programs.
     * Each ExtraProgramPages is 2048 bytes.
     * The sum of ApprovalProgram and ClearStateProgram may not exceed 2048*(1+ExtraProgramPages) bytes.
     */
    apep?: number // Extra program
    /**
     * Boxes
     *
     * The boxes that should be made available for the runtime of the program.
     */
    apbx?: {
        i: number
        n: string
    }[] // Boxes
    /**
     * Encodes the current transaction object into a Uint8Array using the Algorand transaction encoding format.
     *
     * @return {Uint8Array} The encoded transaction as a Uint8Array.
     */
    encode(): Uint8Array {
        return new AlgorandEncoder().encodeTransaction(this)
    }
}
/**
 * Interface representing a builder for creating Application Call transactions.
 * This builder provides methods to configure various attributes of an Application Call transaction.
 *
 * @category Builders
 * @protected
 * @since v1.0.0
 */
export interface IApplicationCallTxBuilder extends ITransactionHeaderBuilder<IApplicationCallTxBuilder> {
    /**
     * {@inheritDoc ApplicationCallTransaction#apid}
     * @param {bigint} apid - The unique identifier of the application to be called.
     */
    addApplicationId(apid: bigint): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apan}
     * @param {number} apan - which action to take
     */
    addOnComplete(apan: number): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apat}
     * @param {string[]} apat - An array of account addresses to be added.
     */
    addAccounts(apat: string[]): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apap}
     * @param {Uint8Array} apap - The approval program bytes to be added to the transaction.
     */
    addApprovalProgram(apap: Uint8Array): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apaa}
     * @param {Uint8Array[]} apaa - Application arguments in bytes
     */
    addApplicationArgs(apaa: Uint8Array[]): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apsu}
     * @param {Uint8Array} apsu - The clear state program bytes to be added
     */
    addClearStateProgram(apsu: Uint8Array): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apfa}
     * @param {bigint[]} apfa - List of foreign application ids
     */
    addForeignApps(apfa: bigint[]): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apas}
     * @param {bigint[]} apas - List of foreign assets ids
     */
    addForeignAssets(apas: bigint[]): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apgs}
     * @param {StateSchema} apgs - Global state schema
     */
    addGlobalSchema(apgs: StateSchema): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apls}
     * @param {StateSchema} apls - Global state schema
     */
    addLocalSchema(apls: StateSchema): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apep}
     * @param {StateSchema} apep - Number of pages to add
     */
    addExtraProgramPages(apep: number): IApplicationCallTxBuilder;
    /**
     * {@inheritDoc ApplicationCallTransaction#apbx}
     * @param apbx - List of boxes
     */
    addBoxes(apbx: { i: number; n: string }[]): IApplicationCallTxBuilder;

    /**
     * Validate the model and return the instance
     */
    get(): ApplicationCallTransaction;
}

/**
 * Class to build an Algorand Application Call Transaction with a fluent interface.
 * This class provides methods to configure various properties of the transaction.
 *
 * This builder can be used to interact with a {@link ApplicationCallTransaction}
 *
 *
 * @category Builders
 * @see {@link AlgorandTransactionCrafter}
 * @since v1.0.0
 */
export class ApplicationCallTxBuilder implements IApplicationCallTxBuilder {
    private readonly tx: ApplicationCallTransaction
    private readonly encoder: AlgorandEncoder

    constructor(genesisId: string, genesisHash: string) {
        this.encoder = new AlgorandEncoder()

        this.tx = new ApplicationCallTransaction();
        this.tx.gen = genesisId;
        this.tx.gh = new Uint8Array(Buffer.from(genesisHash, "base64"));
        this.tx.type = "appl";
        this.tx.fee = 1000n;
    }

    addApplicationId(appId: bigint): IApplicationCallTxBuilder {
        this.tx.apid = appId;
        return this;
    }

    addOnComplete(apan: number): IApplicationCallTxBuilder {
        this.tx.apan = apan;
        return this;
    }

    addAccounts(apat: string[]): IApplicationCallTxBuilder {
        this.tx.apat = apat.map(account => new AlgorandEncoder().decodeAddress(account));
        return this;
    }
    addApprovalProgram(apap: Uint8Array): IApplicationCallTxBuilder {
        this.tx.apap = apap;
        return this;
    }
    addApplicationArgs(apaa: Uint8Array[]): IApplicationCallTxBuilder {
        this.tx.apaa = apaa;
        return this;
    }
    addClearStateProgram(apsu: Uint8Array): IApplicationCallTxBuilder {
        this.tx.apsu = apsu;
        return this;
    }

    addForeignApps(apps: bigint[]): IApplicationCallTxBuilder {
        this.tx.apas = apps;
        return this;
    }
    addForeignAssets(apfa: bigint[]): IApplicationCallTxBuilder {
        this.tx.apfa = apfa;
        return this;
    }
    addGlobalSchema(apgs: StateSchema): IApplicationCallTxBuilder {
        this.tx.apgs = apgs;
        return this;
    }
    addLocalSchema(apls: StateSchema): IApplicationCallTxBuilder {
        this.tx.apls = apls;
        return this;
    }

    addExtraProgramPages(apep: number): IApplicationCallTxBuilder {
        this.tx.apep = apep;
        return this;
    }
    addBoxes(apbx: { i: number; n: string }[]): IApplicationCallTxBuilder {
        this.tx.apbx = apbx;
        return this;
    }
    addSender(sender: string): IApplicationCallTxBuilder {
        this.tx.snd = this.encoder.decodeAddress(sender)
        return this
    }
    addFee(fee: number | bigint): IApplicationCallTxBuilder {
        this.tx.fee = AlgorandEncoder.safeCastBigInt(fee)
        return this
    }
    addFirstValidRound(firstValid: number | bigint): IApplicationCallTxBuilder {
        this.tx.fv = AlgorandEncoder.safeCastBigInt(firstValid)
        return this
    }
    addLastValidRound(lastValid: number | bigint): IApplicationCallTxBuilder {
        this.tx.lv = AlgorandEncoder.safeCastBigInt(lastValid)
        return this
    }
    addNote(note: string, encoding: BufferEncoding = "utf8"): IApplicationCallTxBuilder {
        this.tx.note = new Uint8Array(Buffer.from(note, encoding))
        return this
    }
    addRekey(address: string): IApplicationCallTxBuilder {
        this.tx.rekey = this.encoder.decodeAddress(address)
        return this
    }
    addLease(lease: Uint8Array): IApplicationCallTxBuilder {
        this.tx.lx = lease
        return this
    }
    addGroup(group: Uint8Array): IApplicationCallTxBuilder {
        this.tx.grp = group
        return this
    }
    get(): ApplicationCallTransaction {
        return this.tx;
    }
}
