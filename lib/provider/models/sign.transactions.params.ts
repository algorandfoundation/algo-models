import {IARC0001Transaction} from "../types.js";

export class SignTransactionsParams {
    providerId: string
    txns: IARC0001Transaction[]
}

export interface ISignTransactionsParamsBuilder {
    addProviderId(providerId: string): ISignTransactionsParamsBuilder
    addTxns(txns: IARC0001Transaction[]): ISignTransactionsParamsBuilder
}
export class SignTransactionsParamsBuilder implements  ISignTransactionsParamsBuilder{
    private params: SignTransactionsParams
    constructor() {
        this.params = new SignTransactionsParams()
    }
    addProviderId(providerId: string): SignTransactionsParamsBuilder {
        this.params.providerId = providerId
        return this
    }
    addTxns(txns: IARC0001Transaction[]): SignTransactionsParamsBuilder {
        this.params.txns = txns
        return this
    }
    get(): SignTransactionsParams {
        return this.params
    }
}