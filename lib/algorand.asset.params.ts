import {AlgorandEncoder} from "./algorand.encoder.js";

/**
 * @category Common
 */
export class AssetParams {
    /**
     * Total
     *
     * The total number of base units of the asset to create. This number cannot be changed.
     */
    t?: bigint | undefined
    /**
     * Decimals
     *
     * The number of digits to use after the decimal point when displaying the asset. If 0, the asset is not divisible. If 1, the base unit of the asset is in tenths.
     * If 2, the base unit of the asset is in hundredths, if 3, the base unit of the asset is in thousandths, and so on up to 19 decimal places
     */
    dc?: bigint
    /**
     * Default Frozen
     *
     * True to freeze holdings for this asset by default.
     */
    df?: boolean
    /**
     * Unit Name
     *
     * The name of a unit of this asset. Supplied on creation. Max size is 8 bytes. Example: USDT
     */
    un?: string
    /**
     * Asset Name
     *
     * The name of the asset. Supplied on creation. Max size is 32 bytes. Example: Tether
     */
    an?: string
    /**
     * URL
     *
     * Specifies a URL where more information about the asset can be retrieved. Max size is 96 bytes.
     */
    au?: string
    /**
     * MetaDataHash
     *
     * This field is intended to be a 32-byte hash of some metadata that is relevant to your asset and/or asset holders. The format of this metadata is up to the application. This field can only be specified upon creation.
     * An example might be the hash of some certificate that acknowledges the digitized asset as the official representation of a particular real-world asset.
     */
    am?: Uint8Array
    /**
     * Manager Address
     *
     * The address of the account that can manage the configuration of the asset and destroy it.
     */
    m?: Uint8Array
    /**
     * Reserve Address
     *
     * The address of the account that holds the reserve (non-minted) units of the asset. This address has no specific authority in the protocol itself.
     * It is used in the case where you want to signal to holders of your asset that the non-minted units of the asset reside in an account that is different from the default creator account (the sender).
     */
    r?: Uint8Array
    /**
     * Freeze Address
     * The address of the account used to freeze holdings of this asset. If empty, freezing is not permitted.
     */
    f?: Uint8Array
    /**
     * Clawback Address
     *
     * The address of the account that can clawback holdings of this asset. If empty, clawback is not permitted.
     */
    c?: Uint8Array
}

/**
 * @category Builders
 * @internal
 */
export interface IAssetParamsBuilder {
    addTotal(total: number | bigint): IAssetParamsBuilder
    addDecimals(decimals: number | bigint | bigint): IAssetParamsBuilder
    addDefaultFrozen(frozen: boolean): IAssetParamsBuilder
    addUnitName(unitName: string): IAssetParamsBuilder
    addAssetName(assetName: string): IAssetParamsBuilder
    addMetadataHash(hash: Uint8Array): IAssetParamsBuilder
    addManagerAddress(address: string): IAssetParamsBuilder
    addReserveAddress(address: string): IAssetParamsBuilder
    addFreezeAddress(address: string): IAssetParamsBuilder
    addClawbackAddress(address: string): IAssetParamsBuilder
    get(): AssetParams
}

/**
 * @category Builders
 *
 */
export class AssetParamsBuilder implements IAssetParamsBuilder {
    private params: AssetParams
    private readonly encoder: AlgorandEncoder
    constructor() {
        this.params = new AssetParams()
        this.encoder = new AlgorandEncoder()
    }

    addTotal(total: number | bigint): IAssetParamsBuilder {
        this.params.t = AlgorandEncoder.safeCastBigInt(total)
        return this
    }
    addDecimals(decimals: number | bigint): IAssetParamsBuilder {
        this.params.dc = AlgorandEncoder.safeCastBigInt(decimals)
        return this
    }
    addDefaultFrozen(frozen: boolean): IAssetParamsBuilder {
        this.params.df = frozen
        return this
    }
    addUnitName(unitName: string): IAssetParamsBuilder {
        this.params.un = unitName
        return this
    }
    addAssetName(assetName: string): IAssetParamsBuilder {
        this.params.an = assetName
        return this
    }
    addMetadataHash(hash: Uint8Array): IAssetParamsBuilder {
        this.params.am = hash
        return this
    }
    addManagerAddress(address: string): IAssetParamsBuilder {
        this.params.m = this.encoder.decodeAddress(address)
        return this
    }
    addReserveAddress(address: string): IAssetParamsBuilder {
        this.params.r = this.encoder.decodeAddress(address)
        return this
    }
    addFreezeAddress(address: string): IAssetParamsBuilder {
        this.params.f = this.encoder.decodeAddress(address)
        return this
    }
    addClawbackAddress(address: string): IAssetParamsBuilder {
        this.params.c = this.encoder.decodeAddress(address)
        return this
    }
    get() {
        return this.params
    }
}