import Ajv from "ajv"
import { v7 as uuidv7 } from 'uuid';
import {randomBytes} from "tweetnacl";
import {decode} from "cbor-x";
import addFormats from 'ajv-formats'

import {AlgorandTransactionCrafter} from "../algorand.transaction.crafter";
import {AlgorandEncoder} from "../algorand.encoder";

import {
    fromBase64Url,
    toBase64URL,
    toSignTransactionsParamsRequestMessage,
    toSignTransactionsResultResponseMessage
} from "./api.js";

import ErrorMessage from './schemas/Error.json'
import RequestMessage from './schemas/RequestMessage.json'
import ResponseMessage from './schemas/ResponseMessage.json'
import SignTransactionsParams from './schemas/SignTransactionsParams.json'
import SignTransactionsResults from './schemas/SignTransactionsResult.json'
import * as msgpack from "algo-msgpack-with-bigint";

// Validator
const ajv = new Ajv()
addFormats(ajv)

ajv.addSchema(ErrorMessage)
ajv.addSchema(SignTransactionsParams)
ajv.addSchema(SignTransactionsResults)
ajv.addSchema(RequestMessage)
ajv.addSchema(ResponseMessage)

describe('Utils', () => {
    let algorandCrafter: AlgorandTransactionCrafter
    let algoEncoder: AlgorandEncoder

    const genesisId: string = "GENESIS_ID"
    // genesis in base64
    const genesisHash: string = Buffer.from(randomBytes(32)).toString("base64")

    beforeEach(async () => {
        algorandCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
        algoEncoder = new AlgorandEncoder()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('should create SignTransactionsParams RequestMessage', () => {
        // Provider that should sign the message
        const providerId = uuidv7()
        // Unique Id of the message
        const messageId = uuidv7()

        // A transaction
        const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
        const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
        const note: string = Buffer.from(randomBytes(128)).toString("base64")

        const txn = algorandCrafter
            .pay(1000, from, to)
            .addFirstValidRound(1000)
            .addLastValidRound(2000)
            .addNote(note, "base64")
            .addFee(1000)
            .get()

        // The Request Message as a CBOR encoded Base64URL String
        const messageString = toSignTransactionsParamsRequestMessage(messageId, providerId, [
            {
                txn: toBase64URL(txn.encode())
            }
        ])

        // Decode the bytes
        const bytes = fromBase64Url(messageString)
        // Decode CBOR bytes to Object
        const expectedMessage = decode(bytes)

        // Validate Schema
        const validator = ajv.compile(RequestMessage)
        expect(validator(expectedMessage))

        // Assert Values
        expect(expectedMessage.id).toEqual(messageId)
        expect(expectedMessage.params.providerId).toEqual(providerId)
        expect(algoEncoder.decodeTransaction(fromBase64Url(expectedMessage.params.txns[0].txn))).toEqual(txn)
    })
    it('should create SignTransactionsResults ResponseMessage', ()=>{
        // Provider that should sign the message
        const providerId = uuidv7()
        // Unique Id of the message
        const messageId = uuidv7()
        // Message Id we are responding to
        const requestId = uuidv7()

        // A transaction
        const from: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
        const to: string = algoEncoder.encodeAddress(Buffer.from(randomBytes(32)))
        const note: string = Buffer.from(randomBytes(128)).toString("base64")
        const txn = algorandCrafter
            .pay(1000, from, to)
            .addFirstValidRound(1000)
            .addLastValidRound(2000)
            .addNote(note, "base64")
            .addFee(1000)
            .get()
        const signature: Uint8Array = Buffer.from(randomBytes(64))

        // The Response Message as a CBOR encoded Base64URL String
        const messageString = toSignTransactionsResultResponseMessage(messageId, providerId, requestId, [
            toBase64URL(signature)
        ])

        // Decode the bytes
        const bytes = fromBase64Url(messageString)
        // Decode CBOR bytes to Object
        const expectedMessage = decode(bytes)

        // Validate Schema
        const validator = ajv.compile(ResponseMessage)
        expect(validator(expectedMessage))

        const expectedSignature = fromBase64Url(expectedMessage.result.stxns[0])

        const result: Uint8Array = algorandCrafter.addSignature(txn.encode(), expectedSignature)
        expect(result).toBeDefined()

        const expected = {
            sig: signature,
            txn,
        }
        expect(result).toEqual(msgpack.encode(expected, { sortKeys: true }))
    })
})