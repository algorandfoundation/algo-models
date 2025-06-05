/**
 * @internal
 */
export const ALGORAND_LEASE_LENGTH_ERROR_MSG = "Lease length must be exactly 32 bytes"


/**
 * Specifies the type of transaction. This value is automatically generated using any of the developer tools.
 * @category Common
 */
export type TransactionType = "pay" | "keyreg" | "acfg" | "axfer" | "afrz" | "appl" | "stpf"



/**
 *
 * Transaction Header
 *
 * Shared keys for all transactions
 *
 * @category Common
 */
export abstract class TransactionHeader {
    /**
     * Transaction Type
     *
     * Specifies the type of transaction. This value is automatically generated using any of the developer tools.
     */
    type: TransactionType
    /**
     * Sender
     *
     * The address of the account that pays the fee and amount.
     */
    snd: Uint8Array
    /**
     * Fee
     *
     * Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos.
     */
    fee: bigint
    /**
     * First Valid
     *
     * The first round for when the transaction is valid. If the transaction is sent prior to this round it will be rejected by the network.
     */
    fv: bigint
    /**
     * Last Valid
     *
     * The ending round for which the transaction is valid. After this round, the transaction will be rejected by the network.
     */
    lv: bigint
    /**
     * Genesis Hash
     *
     * The hash of the genesis block of the network for which the transaction is valid. See the genesis hash for MainNet, TestNet, and BetaNet.
     */
    gh: Uint8Array
    /**
     * Genesis ID
     *
     * The human-readable string that identifies the network for the transaction.
     * The genesis ID is found in the genesis block. See the genesis ID for MainNet, TestNet, and BetaNet.
     */
    gen?: string
    /**
     * Note
     *
     * Any data up to 1000 bytes.
     */
    note?: Uint8Array
    /**
     * Rekey To
     *
     * Specifies the authorized address. This address will be used to authorize all future transactions.
     */
    rekey?: Uint8Array
    /**
     * Lease
     *
     * A lease enforces mutual exclusion of transactions. If this field is nonzero, then once the transaction is confirmed,
     * it acquires the lease identified by the (Sender, Lease) pair of the transaction until the LastValid round passes.
     * While this transaction possesses the lease, no other transaction specifying this lease can be confirmed.
     * A lease is often used in the context of Algorand Smart Contracts to prevent replay attacks.
     * Read more about Algorand Smart Contracts. Leases can also be used to safeguard against unintended duplicate spends.
     * For example, if I send a transaction to the network and later realize my fee was too low,
     * I could send another transaction with a higher fee, but the same lease value.
     * This would ensure that only one of those transactions ends up getting confirmed during the validity period.
     */
    lx?: Uint8Array
    /**
     * Group
     *
     * The group specifies that the transaction is part of a group and, if so, specifies the hash of the transaction group.
     * Assign a group ID to a transaction through the workflow described in the Atomic Transfers Guide.
     */
    grp?: Uint8Array

    /**
     * validateLease
     * 
     * static helped method to validate lease length
     */
	static validateLease(lx: Uint8Array) {
		if (lx.length !== 32) {
			throw new Error(ALGORAND_LEASE_LENGTH_ERROR_MSG)
		}
	}
}

/**
 * Interface for Transaction Header Builders
 * @category Builders
 * @internal
 */
export interface ITransactionHeaderBuilder<T> {
    /**
     * Add Sender
     *
     * @param sender The address of the account that pays the fee and amount.
     */
    addSender(sender: string): T

    /**
     * Add Fee
     *
     * @param fee Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos.
     */
    addFee(fee: number | bigint): T

    /**
     * Add First Valid Round
     *
     * @param fv The first round for when the transaction is valid. If the transaction is sent prior to this round it will be rejected by the network.
     */
    addFirstValidRound(fv: number | bigint): T

    /**
     * Add Last Valid Round
     *
     * @param lv The ending round for which the transaction is valid. After this round, the transaction will be rejected by the network.
     */
    addLastValidRound(lv: number | bigint): T

    /**
     * Add Note
     *
     * @param note Any data up to 1000 bytes.
     * @param encoding
     */
    addNote(note: string, encoding?: BufferEncoding): T

    /**
     * Add Rekey Address
     *
     * @param rekey Specifies the authorized address. This address will be used to authorize all future transactions.
     */
    addRekey(rekey: string): T

    /**
     * Add Lease
     *
     * @param lx A lease enforces mutual exclusion of transactions. If this field is nonzero, then once the transaction
     * is confirmed, it acquires the lease identified by the (Sender, Lease) pair of the transaction until the LastValid round passes.
     */
    addLease(lx: Uint8Array): T

    /**
     * Add Group
     *
     * @param grp The group specifies that the transaction is part of a group and, if so, specifies the hash of the transaction group.
     */
    addGroup(grp: Uint8Array): T
}
