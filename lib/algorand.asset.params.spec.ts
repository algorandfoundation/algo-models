// #region imports
import {AssetParams, AssetParamsBuilder} from "./algorand.asset.params";

// #endregion imports
describe("AssetParams", () => {
    it("(OK) AssetParams Builder", async () => {
        // #region quickStart
        const assetParams = new AssetParamsBuilder()
            .addTotal(1000)
            .addDecimals(1)
            .addAssetName('Yet Another Asset')
            .addUnitName('YEET')
            .get()
        // #endregion quickStart

        expect(assetParams).toBeDefined()
        expect(assetParams).toBeInstanceOf(AssetParams)
    })
})
