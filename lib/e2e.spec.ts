import {AlgorandClient, waitForConfirmation} from '@algorandfoundation/algokit-utils'
import {
  AlgorandTransactionCrafter,
  ApplicationCallTxBuilder,
  AssetConfigTransaction,
  AssetParamsBuilder, 
} from "./index";
import {Address, SuggestedParams} from "algosdk";
import {SigningAccount, TransactionSignerAccount} from "@algorandfoundation/algokit-utils/types/account";
import {AlgoAmount} from "@algorandfoundation/algokit-utils/types/amount";
import {encode} from "hi-base32";
import {sha512_256} from "js-sha512";
import {Arc56Contract} from "@algorandfoundation/algokit-utils/types/app-arc56";

export type KeyPairRecord = {
  id: string
  keyPair: CryptoKeyPair
}

const HASH_BYTES_LENGTH = 32;
const ALGORAND_CHECKSUM_BYTE_LENGTH = 4;
const ALGORAND_ADDRESS_LENGTH = 58;

export async function sign(txn: Uint8Array, kpr: KeyPairRecord) {
  const sig = await crypto.subtle.sign(
    { name: 'Ed25519' },
    kpr.keyPair.privateKey,
    txn,
  );
  return new Uint8Array(sig)
}
/**
 * Get the address of a key pair
 * @param keyPair
 */
export async function getAddress(keyPair: CryptoKeyPair) {
  const key = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey))
  return encodeAddress(key)
}
/**
 * Create a new key pair
 * @param extractable
 * @param keyUsages
 */
export async function generateKey(extractable: boolean = false, keyUsages: KeyUsage[] = ["sign"]) {
  const keyPair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, extractable, keyUsages) as CryptoKeyPair)
  return { keyPair, id: await getAddress(keyPair) } as KeyPairRecord
}
/**
 * Encode a public key to an address
 * @param publicKey
 */
export function encodeAddress(publicKey: Uint8Array) {
  // Concatenate the publicKey and the checksum, remove the extra '====' and return the base32 encoding
  return `${encode([...publicKey, ...generateChecksum(publicKey)])}`.slice(0, ALGORAND_ADDRESS_LENGTH);
}

/**
 * Generate the checksum of a public key
 * @param publicKey
 */
export function generateChecksum(publicKey: Uint8Array) {
  return sha512_256.array(publicKey)
    .slice(
      HASH_BYTES_LENGTH - ALGORAND_CHECKSUM_BYTE_LENGTH,
      HASH_BYTES_LENGTH
    );
}

describe('Algorand Transaction Crafter', () => {
  let genesisId: string
  let genesisHash: string

  let algorand: AlgorandClient
  let deployer: Address & TransactionSignerAccount & {
    account: SigningAccount;
  }
  let params: SuggestedParams
  let algorandCrafter: AlgorandTransactionCrafter
  let masterKeyPair: KeyPairRecord
  let secondaryKeyPair: KeyPairRecord


  beforeAll(async () => {
    algorand = AlgorandClient.fromEnvironment()
    deployer = await algorand.account.fromEnvironment('DEPLOYER', new AlgoAmount({algos: 10000}))

    masterKeyPair = await generateKey()
    secondaryKeyPair = await generateKey()

    await algorand.account.ensureFunded(masterKeyPair.id, deployer, new AlgoAmount({ algos: 10 }))
    await algorand.account.ensureFunded(secondaryKeyPair.id, deployer, new AlgoAmount({ algos: 10 }))

    params = await algorand.getSuggestedParams()
    genesisId = params.genesisID as string
    genesisHash = Buffer.from(params.genesisHash as Uint8Array).toString('base64')
    algorandCrafter = new AlgorandTransactionCrafter(genesisId, genesisHash)
  }, 10000)

  it("(OK) Pay Transaction", async () => {
    const txn = algorandCrafter
      .pay(1000, masterKeyPair.id, masterKeyPair.id)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()

    const encodedTxn = txn.encode()
    const signature = await sign(encodedTxn, masterKeyPair)
    const signed = algorandCrafter.addSignature(encodedTxn, signature)
    const { txid } = await algorand.client.algod.sendRawTransaction(signed).do()
    await waitForConfirmation(txid, 20, algorand.client.algod)
  })
  it("(OK) KeyReg Online/Offline Transaction", async () => {
    let account = await algorand.client.algod.accountInformation(masterKeyPair.id).do()
    expect(account.status).toEqual("Offline")
    const onlineTxn = algorandCrafter
      .changeOnline(
        masterKeyPair.id,
        // Vote Key
        "CR3Bf/IJqzHC1TORQe83QnAkcB+JLyb+opP8f8q3ke0=",
        // Selection Key
        "CAdOmC4N+IqY40TkxNmGfzbuKXFCJr+ZUalwminLqAY=",
        // State Key
        "NhHc7r4U+lZhZCVVGD2LNnnyCx5ZxuHlEwyKQ3n4/41hEsQdZu/DSFeJiVMmKT/JmOiO8K/hWbb1865iaJmLlQ==",
        params.firstValid,
        params.lastValid,
        100,
      )
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()
    const onlineEncodedTxn = onlineTxn.encode()
    const onlineSignature = await sign(onlineEncodedTxn, masterKeyPair)
    const onlineSigned = algorandCrafter.addSignature(onlineEncodedTxn, onlineSignature)
    const onlineStatus = await algorand.client.algod.sendRawTransaction(onlineSigned).do()
    await waitForConfirmation(onlineStatus.txid, 20, algorand.client.algod)
    account = await algorand.client.algod.accountInformation(masterKeyPair.id).do()
    expect(account.status).toEqual("Online")

    // create keyreg transaction
    const offlineTxn = algorandCrafter
      .changeOffline(masterKeyPair.id)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()

    const offlineEncodedTxn = offlineTxn.encode()
    const offlineSignature = await sign(offlineEncodedTxn, masterKeyPair)
    const offlineSigned = algorandCrafter.addSignature(offlineEncodedTxn, offlineSignature)
    const offlineStatus = await algorand.client.algod.sendRawTransaction(offlineSigned).do()
    await waitForConfirmation(offlineStatus.txid, 20, algorand.client.algod)
  })
  it("(OK) Non-participation Transactions", async () => {
    const txn = algorandCrafter
      .markNonParticipation(masterKeyPair.id)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()
    const encodedTxn = txn.encode()
    const signature = await sign(encodedTxn, masterKeyPair)
    const signed = algorandCrafter.addSignature(encodedTxn, signature)
    const { txid } = await algorand.client.algod.sendRawTransaction(signed).do()
    await waitForConfirmation(txid, 20, algorand.client.algod)
  })

  it("(OK) Asset Config Create/OptIn/Transfer/Destroy", async () => {
    const assetParams = new AssetParamsBuilder()
      .addTotal(1000)
      .addDecimals(1)
      .addManagerAddress(masterKeyPair.id)
      .addAssetName("Big Yeetus")
      .addUnitName("YEET")
      .get()

    // create asset transaction
    const createTxn: AssetConfigTransaction = algorandCrafter
      .createAsset(masterKeyPair.id, assetParams)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()

    const createEncodedTxn = createTxn.encode()
    const createSignature = await sign(createEncodedTxn, masterKeyPair)
    const createSigned = algorandCrafter.addSignature(createEncodedTxn, createSignature)
    const createResult = await algorand.client.algod.sendRawTransaction(createSigned).do()
    const { assetIndex } = await waitForConfirmation(createResult.txid, 20, algorand.client.algod)


    const optInTxn = algorandCrafter
      .transferAsset(secondaryKeyPair.id, assetIndex as bigint, secondaryKeyPair.id, 0)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()


    const optInEncodedTxn = optInTxn.encode()
    const optInSignature = await sign(optInEncodedTxn, secondaryKeyPair)
    const optInSigned = algorandCrafter.addSignature(optInEncodedTxn, optInSignature)
    const optInResult = await algorand.client.algod.sendRawTransaction(optInSigned).do()
    await waitForConfirmation(optInResult.txid, 20, algorand.client.algod)



    const transferTxn = algorandCrafter
      .transferAsset(masterKeyPair.id, assetIndex as bigint, secondaryKeyPair.id, 10)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()

    const transferEncodedTxn = transferTxn.encode()
    const transferSignature = await sign(transferEncodedTxn, masterKeyPair)
    const transferSigned = algorandCrafter.addSignature(transferEncodedTxn, transferSignature)
    const transferResult = await algorand.client.algod.sendRawTransaction(transferSigned).do()
    await waitForConfirmation(transferResult.txid, 20, algorand.client.algod)

    const closeOutTxn = algorandCrafter
      .transferAsset(secondaryKeyPair.id, assetIndex as bigint, secondaryKeyPair.id, 0)
      .addAssetCloseTo(masterKeyPair.id)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()


    const closeOutEncodedTxn = closeOutTxn.encode()
    const closeOutSignature = await sign(closeOutEncodedTxn, secondaryKeyPair)
    const closeOutSigned = algorandCrafter.addSignature(closeOutEncodedTxn, closeOutSignature)
    const closeOutResult = await algorand.client.algod.sendRawTransaction(closeOutSigned).do()
    await waitForConfirmation(closeOutResult.txid, 20, algorand.client.algod)

    const destroyTxn: AssetConfigTransaction = algorandCrafter
      .destroyAsset(masterKeyPair.id, assetIndex as bigint)
      .addFirstValidRound(params.firstValid)
      .addLastValidRound(params.lastValid)
      .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
      .get()

    const destroyEncodedTxn = destroyTxn.encode()
    const destroySignature = await sign(destroyEncodedTxn, masterKeyPair)
    const destroySigned = algorandCrafter.addSignature(destroyEncodedTxn, destroySignature)
    const destroyResult = await algorand.client.algod.sendRawTransaction(destroySigned).do()
    await waitForConfirmation(destroyResult.txid, 20, algorand.client.algod)
  })
  it("(OK Application Create/Delete)", async ()=>{
    const appSpec = {
      "name": "HelloWorld",
      "structs": {},
      "methods": [
        {
          "name": "hello",
          "args": [
            {
              "type": "string",
              "name": "name"
            }
          ],
          "returns": {
            "type": "string"
          },
          "actions": {
            "create": [],
            "call": [
              "NoOp"
            ]
          },
          "readonly": false,
          "events": [],
          "recommendations": {}
        }
      ],
      "arcs": [
        22,
        28
      ],
      "networks": {},
      "state": {
        "schema": {
          "global": {
            "ints": 0,
            "bytes": 0
          },
          "local": {
            "ints": 0,
            "bytes": 0
          }
        },
        "keys": {
          "global": {},
          "local": {},
          "box": {}
        },
        "maps": {
          "global": {},
          "local": {},
          "box": {}
        }
      },
      "bareActions": {
        "create": [
          "NoOp"
        ],
        "call": []
      },
      "sourceInfo": {
        "approval": {
          "sourceInfo": [
            {
              "pc": [
                25
              ],
              "errorMessage": "OnCompletion is not NoOp"
            },
            {
              "pc": [
                66
              ],
              "errorMessage": "can only call when creating"
            },
            {
              "pc": [
                28
              ],
              "errorMessage": "can only call when not creating"
            }
          ],
          "pcOffsetMethod": "none"
        },
        "clear": {
          "sourceInfo": [],
          "pcOffsetMethod": "none"
        }
      },
      "source": {
        "approval": "I3ByYWdtYSB2ZXJzaW9uIDEwCiNwcmFnbWEgdHlwZXRyYWNrIGZhbHNlCgovLyBhbGdvcHkuYXJjNC5BUkM0Q29udHJhY3QuYXBwcm92YWxfcHJvZ3JhbSgpIC0+IHVpbnQ2NDoKbWFpbjoKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9oZWxsb193b3JsZC9jb250cmFjdC5weTo1CiAgICAvLyBjbGFzcyBIZWxsb1dvcmxkKEFSQzRDb250cmFjdCk6CiAgICB0eG4gTnVtQXBwQXJncwogICAgYnogbWFpbl9iYXJlX3JvdXRpbmdANgogICAgcHVzaGJ5dGVzIDB4MDJiZWNlMTEgLy8gbWV0aG9kICJoZWxsbyhzdHJpbmcpc3RyaW5nIgogICAgdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAogICAgbWF0Y2ggbWFpbl9oZWxsb19yb3V0ZUAzCgptYWluX2FmdGVyX2lmX2Vsc2VAMTA6CiAgICAvLyBzbWFydF9jb250cmFjdHMvaGVsbG9fd29ybGQvY29udHJhY3QucHk6NQogICAgLy8gY2xhc3MgSGVsbG9Xb3JsZChBUkM0Q29udHJhY3QpOgogICAgcHVzaGludCAwIC8vIDAKICAgIHJldHVybgoKbWFpbl9oZWxsb19yb3V0ZUAzOgogICAgLy8gc21hcnRfY29udHJhY3RzL2hlbGxvX3dvcmxkL2NvbnRyYWN0LnB5OjYKICAgIC8vIEBhYmltZXRob2QoKQogICAgdHhuIE9uQ29tcGxldGlvbgogICAgIQogICAgYXNzZXJ0IC8vIE9uQ29tcGxldGlvbiBpcyBub3QgTm9PcAogICAgdHhuIEFwcGxpY2F0aW9uSUQKICAgIGFzc2VydCAvLyBjYW4gb25seSBjYWxsIHdoZW4gbm90IGNyZWF0aW5nCiAgICAvLyBzbWFydF9jb250cmFjdHMvaGVsbG9fd29ybGQvY29udHJhY3QucHk6NQogICAgLy8gY2xhc3MgSGVsbG9Xb3JsZChBUkM0Q29udHJhY3QpOgogICAgdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQogICAgZXh0cmFjdCAyIDAKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9oZWxsb193b3JsZC9jb250cmFjdC5weTo2CiAgICAvLyBAYWJpbWV0aG9kKCkKICAgIGNhbGxzdWIgaGVsbG8KICAgIGR1cAogICAgbGVuCiAgICBpdG9iCiAgICBleHRyYWN0IDYgMgogICAgc3dhcAogICAgY29uY2F0CiAgICBwdXNoYnl0ZXMgMHgxNTFmN2M3NQogICAgc3dhcAogICAgY29uY2F0CiAgICBsb2cKICAgIHB1c2hpbnQgMSAvLyAxCiAgICByZXR1cm4KCm1haW5fYmFyZV9yb3V0aW5nQDY6CiAgICAvLyBzbWFydF9jb250cmFjdHMvaGVsbG9fd29ybGQvY29udHJhY3QucHk6NQogICAgLy8gY2xhc3MgSGVsbG9Xb3JsZChBUkM0Q29udHJhY3QpOgogICAgdHhuIE9uQ29tcGxldGlvbgogICAgYm56IG1haW5fYWZ0ZXJfaWZfZWxzZUAxMAogICAgdHhuIEFwcGxpY2F0aW9uSUQKICAgICEKICAgIGFzc2VydCAvLyBjYW4gb25seSBjYWxsIHdoZW4gY3JlYXRpbmcKICAgIHB1c2hpbnQgMSAvLyAxCiAgICByZXR1cm4KCgovLyBzbWFydF9jb250cmFjdHMuaGVsbG9fd29ybGQuY29udHJhY3QuSGVsbG9Xb3JsZC5oZWxsbyhuYW1lOiBieXRlcykgLT4gYnl0ZXM6CmhlbGxvOgogICAgLy8gc21hcnRfY29udHJhY3RzL2hlbGxvX3dvcmxkL2NvbnRyYWN0LnB5OjYtNwogICAgLy8gQGFiaW1ldGhvZCgpCiAgICAvLyBkZWYgaGVsbG8oc2VsZiwgbmFtZTogU3RyaW5nKSAtPiBTdHJpbmc6CiAgICBwcm90byAxIDEKICAgIC8vIHNtYXJ0X2NvbnRyYWN0cy9oZWxsb193b3JsZC9jb250cmFjdC5weTo4CiAgICAvLyByZXR1cm4gIkhlbGxvLCAiICsgbmFtZQogICAgcHVzaGJ5dGVzICJIZWxsbywgIgogICAgZnJhbWVfZGlnIC0xCiAgICBjb25jYXQKICAgIHJldHN1Ygo=",
        "clear": "I3ByYWdtYSB2ZXJzaW9uIDEwCiNwcmFnbWEgdHlwZXRyYWNrIGZhbHNlCgovLyBhbGdvcHkuYXJjNC5BUkM0Q29udHJhY3QuY2xlYXJfc3RhdGVfcHJvZ3JhbSgpIC0+IHVpbnQ2NDoKbWFpbjoKICAgIHB1c2hpbnQgMSAvLyAxCiAgICByZXR1cm4K"
      },
      "byteCode": {
        "approval": "CjEbQQA0gAQCvs4RNhoAjgEAA4EAQzEZFEQxGEQ2GgFXAgCIACBJFRZXBgJMUIAEFR98dUxQsIEBQzEZQP/UMRgURIEBQ4oBAYAHSGVsbG8sIIv/UIk=",
        "clear": "CoEBQw=="
      },
      "compilerInfo": {
        "compiler": "puya",
        "compilerVersion": {
          "major": 4,
          "minor": 5,
          "patch": 3
        }
      },
      "events": [],
      "templateVariables": {}
    } as Arc56Contract

    // Create Transaction Factory using Master KeyPair
    const client = algorand.client.getAppFactory({
      appSpec,
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer
    })

    const compilationResult = await client.compile()

    const applicationCallTransaction = new ApplicationCallTxBuilder(genesisId, genesisHash)
        .addSender(masterKeyPair.id)
        .addApprovalProgram(compilationResult.approvalProgram)
        .addClearStateProgram(compilationResult.clearStateProgram)
        .addFirstValidRound(params.firstValid)
        .addLastValidRound(params.lastValid)
        .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
        .get()


    const encodedTxn = applicationCallTransaction.encode()
    const signature = await sign(encodedTxn, masterKeyPair)
    const signed = algorandCrafter.addSignature(encodedTxn, signature)
    const {txid} = await algorand.client.algod.sendRawTransaction(signed).do()
    const {applicationIndex} = await waitForConfirmation(txid, 20, algorand.client.algod)

    const callMethodTransaction = new ApplicationCallTxBuilder(genesisId, genesisHash)
        .addApplicationId(applicationIndex as bigint)
        .addApplicationArgs([new Uint8Array(sha512_256.array(Buffer.from("hello(string)string")).slice(0, 4)), Buffer.from("world")])
        .addSender(masterKeyPair.id)
        .addFirstValidRound(params.firstValid)
        .addLastValidRound(params.lastValid)
        .addFee(Number(params.fee) < 1000 ? 1000 : params.fee)
        .get()

    const callMethodEncodedTxn = callMethodTransaction.encode()
    const callMethodSignature = await sign(callMethodEncodedTxn, masterKeyPair)
    const callMethodSigned = algorandCrafter.addSignature(callMethodEncodedTxn, callMethodSignature)
    const callMethodResult = await algorand.client.algod.sendRawTransaction(callMethodSigned).do()
    await waitForConfirmation(callMethodResult.txid, 20, algorand.client.algod)
  })
})
