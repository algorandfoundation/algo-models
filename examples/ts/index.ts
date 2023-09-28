import { AlgorandTransactionCrafter } from '@algorandfoundation/transaction-crafter'

const atc = new AlgorandTransactionCrafter("testnet-v1.0", "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=")
let pay = atc.pay(123, 'R2HYOMCQIIVZLYYSVQ7RRDME5QB2NNACNIYEYIIN3NCTEKHEVE4RJRNWN4', 'R2HYOMCQIIVZLYYSVQ7RRDME5QB2NNACNIYEYIIN3NCTEKHEVE4RJRNWN4')
//console.log(Buffer.from(pay.get().encode()).toString('base64'))
console.log(pay)
