
import { AlgorandTransactionCrafter } from '@algorandfoundation/algo-models'
import {SignTransactionsParams} from "@algorandfoundation/algo-models/provider";

let atc = new AlgorandTransactionCrafter('testnet-v1.0', 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=')
let pay = atc.pay(123, 'R2HYOMCQIIVZLYYSVQ7RRDME5QB2NNACNIYEYIIN3NCTEKHEVE4RJRNWN4', 'R2HYOMCQIIVZLYYSVQ7RRDME5QB2NNACNIYEYIIN3NCTEKHEVE4RJRNWN4')
//console.log(Buffer.from(pay.get().encode()).toString('base64'))
console.log(pay)
console.log(SignTransactionsParams)