import {Reference} from "../types.js";
import {SignTransactionsParams} from "./sign.transactions.params.js";

export type Params = SignTransactionsParams // | Add other Params Here

/**
 * Represents a request message object.
 *
 * @class
 * @constructor
 * @param {string} id - The unique identifier of the request message.
 * @param {Reference} reference - The reference object associated with the request message.
 */
export class RequestMessage{
    id: string
    reference: Reference
    params: Params

    constructor(id: string, reference: Reference) {
        this.id = id;
        this.reference = reference;
    }
}

export interface IRequestMessageBuilder{
    addParams(params: Params): IRequestMessageBuilder
}

export class RequestMessageBuilder implements IRequestMessageBuilder{
    private request: RequestMessage
    constructor(id: string, reference: Reference) {
        this.request = new RequestMessage(id, reference);
    }
    addParams(params: Params): RequestMessageBuilder {
        this.request.params = params;
        return this;
    }
    get(){
        return this.request
    }
}
