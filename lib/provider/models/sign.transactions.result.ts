export class SignTransactionsResult {
    providerId: string
    stxns: string[]
}

export interface ISignTransactionsResultBuilder {
    addProviderId(providerId: string): ISignTransactionsResultBuilder
    addSignedTxns(stxns: string[]): ISignTransactionsResultBuilder
}
export class SignTransactionsResultBuilder implements  ISignTransactionsResultBuilder{
    private result: SignTransactionsResult
    constructor() {
        this.result = new SignTransactionsResult()
    }
    addProviderId(providerId: string): SignTransactionsResultBuilder {
        this.result.providerId = providerId
        return this
    }
    addSignedTxns(stxns: string[]): SignTransactionsResultBuilder {
        this.result.stxns = stxns
        return this
    }
    get(): SignTransactionsResult {
        return this.result
    }
}