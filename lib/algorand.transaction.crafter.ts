import { Crafter } from "./crafter.role.js"
import { AlgorandEncoder } from "./algorand.encoder.js"
import { type IPayTxBuilder, PayTxBuilder } from "./algorand.transaction.pay.js"
import { type IKeyregTxBuilder, KeyregTxBuilder } from "./algorand.transaction.keyreg.js"
import * as msgpack from "algo-msgpack-with-bigint"
import {AssetParams} from "./algorand.asset.params.js";
import {AssetConfigTxBuilder, IAssetConfigTxBuilder} from "./algorand.transaction.acfg.js";
import {AssetFreezeTxBuilder, IAssetFreezeTxBuilder} from "./algorand.transaction.afrz.js";
import {AssetTransferTxBuilder, IAssetTransferTxBuilder} from "./algorand.transaction.axfer.js";

/**
 * @category SDK
 */
export class AlgorandTransactionCrafter extends Crafter {
	constructor(private readonly genesisId: string, private readonly genesisHash: string) {
		super()
	}
	/**
	 * Payment Transaction
	 *
	 * @param amount The total amount to be sent in microAlgos.
	 * @param from The address of the account that pays the fee and amount.
	 * @param to The address of the account that receives the amount.
	 */
	pay(amount: number, from: string, to: string): IPayTxBuilder {
		return new PayTxBuilder(this.genesisId, this.genesisHash).addAmount(amount).addSender(from).addReceiver(to)
	}
	/**
	 * Online Key Registration Transaction
	 *
	 * @param from The address of the account that pays the fee and amount.
	 * @param voteKey The root participation public key.
	 * @param selectionKey The VRF public key.
	 * @param stateProofKey The 64 byte state proof public key commitment.
	 * @param voteFirst The first round that the participation key is valid.
	 * @param voteLast The last round that the participation key is valid.
	 * @param voteKeyDilution This is the dilution for the 2-level participation key.
	 */
	changeOnline(from: string, voteKey: string, selectionKey: string, stateProofKey: string, voteFirst: number, voteLast: number, voteKeyDilution: number): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
			.addVoteKey(voteKey)
			.addSelectionKey(selectionKey)
			.addStateProofKey(stateProofKey)
			.addVoteFirst(voteFirst)
			.addVoteLast(voteLast)
			.addVoteKeyDilution(voteKeyDilution)
	}
	/**
	 * Offline Key Registration Transaction
	 *
	 * @param from The address of the account that pays the fee and amount.
	 */
	changeOffline(from: string): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
	}
	/**
	 * Mark Non-Participation Transaction
	 *
	 * @param from The address of the account that pays the fee and amount.
	 */
	markNonParticipation(from: string): IKeyregTxBuilder {
		return new KeyregTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
			.addNonParticipation(true)
	}
	/**
	 * Create a new Asset
	 *
	 * @param from The address of the account that pays the fee and amount.
	 * @param params Asset Parameters
	 */
	createAsset(from: string, params: AssetParams): IAssetConfigTxBuilder {
		return new AssetConfigTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
			.addAssetParams(params)
	}
	/**
	 * Destroy an existing Asset
	 *
	 * @param from The address of the account that pays the fee and amount.
	 * @param caid Unique asset ID.
	 */
	destroyAsset(from: string, caid: number | bigint): IAssetConfigTxBuilder {
		return new AssetConfigTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
			.addAssetId(caid)
	}
	/**
	 * Freeze an Asset
	 *
	 * @param fadd The address of the account whose asset is being frozen or unfrozen.
	 * @param faid The asset ID being frozen or unfrozen.
	 * @param afrz True to freeze the asset.
	 */
	freezeAsset(fadd: string, faid: number, afrz: boolean): IAssetFreezeTxBuilder {
		return new AssetFreezeTxBuilder(this.genesisId, this.genesisHash)
			.addFreezeAccount(fadd)
			.addFreezeAsset(faid)
			.addAssetFrozen(afrz)
	}
	/**
	 * Transfer Asset Transaction
	 *
	 * @param from The address of the account that pays the fee and amount.
	 * @param xaid The unique ID of the asset to be transferred.
	 * @param arcv The recipient of the asset transfer.
	 * @param aamt The amount of the asset to be transferred.
	 */
	transferAsset(from: string, xaid: number, arcv: string, aamt: number | bigint): IAssetTransferTxBuilder {
		return new AssetTransferTxBuilder(this.genesisId, this.genesisHash)
			.addSender(from)
			.addAssetId(xaid)
			.addAssetAmount(aamt)
			.addAssetReceiver(arcv)
	}
	/**
	 * Add Signature
	 *
	 * @param encodedTransaction Transaction Bytes
	 * @param signature Signature Bytes
	 */
	addSignature(encodedTransaction: Uint8Array, signature: Uint8Array): Uint8Array {
		// remove TAG prefix
		const txObj = new AlgorandEncoder().decodeTransaction(encodedTransaction)

		const signedTx = {
			sig: signature,
			txn: txObj,
		}

		// Encode without TAG
		return msgpack.encode(signedTx, { sortKeys: true })
	}
}
