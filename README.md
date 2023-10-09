# Algorand Transaction Crafting and Signing Instructions

## Tests

```shell
$ yarn install
$ yarn test:cov
```

## Craft Pay Transaction

```ts
import { PayTransaction, PayTxBuilder } from 'algorand.transaction.pay.ts'

// Some values
const genesisHash = "someGenesisHash"
const genId = "someGenId"
const amount = 1000
const from = "someAddress"
const to = "someOtherAddress"
const firstValidRound = 1000
const lastValidRound = 2000

const tx: PayTransaction = new PayTxBuilder(genId, genesisHash)
    .addAmount(amount)
    .addSender(from)
    .addReceiver(to)
    .addFirstValidRound(firstValidRound)
    .addLastValidRound(lastValidRound)
    .get()

const encoded: Uint8Array = tx.encode()

// sign encoded
// attach signature
// push

```


## Schemas for models

Available in [schemas](./lib/schemas) folder
