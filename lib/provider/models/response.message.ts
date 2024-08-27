import {Reference} from "../types.js";
import {SignTransactionsResult} from "./sign.transactions.result.js";

export type Results = SignTransactionsResult // | Add other Result Types Here

export class ResponseMessage {
    id: string
    reference: Reference
    requestId: string
    result: Results

    constructor(id: string, requestId: string, reference: Reference) {
        this.id = id;
        this.requestId = requestId;
        this.reference = reference;
    }

}

export interface IResponseMessageBuilder{
    addResult(result: Results): IResponseMessageBuilder
}

export class ResponseMessageBuilder implements IResponseMessageBuilder{
    private response: ResponseMessage
    constructor(id: string, requestId: string, reference: Reference) {
        this.response = new ResponseMessage(id, requestId, reference)
    }
    addResult(result: Results): ResponseMessageBuilder {
        this.response.result = result
        return this
    }
    get(){
        return this.response
    }
}