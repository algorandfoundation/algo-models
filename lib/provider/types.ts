
export type Reference = "arc0027:disable:request" |
    // "arc0027:discover:request" |
    // "arc0027:enable:request" |
    "arc0027:post_transactions:request" |
    "arc0027:sign_and_post_transactions:request" |
    "arc0027:sign_message:request" |
    "arc0027:sign_transactions:request" |
    // "arc0027:disable:response" |
    // "arc0027:discover:response" |
    // "arc0027:enable:response" |
    "arc0027:post_transactions:response" |
    "arc0027:sign_and_post_transactions:response" |
    "arc0027:sign_message:response" |
    "arc0027:sign_transactions:response"

export interface MultisigMetadata {
    /**
     * Multisig version
     */
    version: number;

    /**
     * Multisig threshold value. Authorization requires a subset of signatures,
     * equal to or greater than the threshold value.
     */
    threshold: number;

    /**
     * A list of Algorand addresses representing possible signers for this multisig. Order is important.
     */
    addrs: string[];
}

export interface IARC0001Transaction {
    authAddr?: string;
    msig?: MultisigMetadata;
    signers?: string[];
    stxn?: string;
    txn: string;
}