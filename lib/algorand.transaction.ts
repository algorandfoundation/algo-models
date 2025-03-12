import {PayTransaction} from "./algorand.transaction.pay.js";
import {AssetConfigTransaction} from "./algorand.transaction.acfg.js";
import {AssetTransferTransaction} from "./algorand.transaction.axfer.js";
import {AssetFreezeTransaction} from "./algorand.transaction.afrz.js";
import {KeyregTransaction} from "./algorand.transaction.keyreg.js";
import {ApplicationCallTransaction} from "./algorand.transaction.appl";

/**
 * Transaction Alias
 *
 * All transactions extend from
 *
 * @category Common
 */
export type Transaction = PayTransaction | AssetConfigTransaction | AssetTransferTransaction | AssetFreezeTransaction | KeyregTransaction | ApplicationCallTransaction

// SignedTransaction
export interface SignedTransaction {
    /**
     * Transaction
     */
    txn: Transaction

    /**
     * Transaction Signature
     */
    sig: Uint8Array
}