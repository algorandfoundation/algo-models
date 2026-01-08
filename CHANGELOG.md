# [1.0.0-canary.7](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.6...v1.0.0-canary.7) (2026-01-08)


### Features

* application call transactions ([44e6baf](https://github.com/algorandfoundation/algo-models/commit/44e6baf1c328f130e0aedffc28921d1cfd5a2ae2))

# [1.0.0-canary.6](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.5...v1.0.0-canary.6) (2025-12-09)


### Bug Fixes

* address rekey ([e7efcd6](https://github.com/algorandfoundation/algo-models/commit/e7efcd634fb94ad1517552a9c173cb42f2ddd595))
* allow for the undefined type and rely on msgpack to omit those fields ([c106e6e](https://github.com/algorandfoundation/algo-models/commit/c106e6ef41ec15a87189146a34b7ecd7dc43034b))
* apply suggestions from code review ([ca4036d](https://github.com/algorandfoundation/algo-models/commit/ca4036dff89a091acca2954b697c6e1c34281dab))
* consider nested boolean ([f8773f4](https://github.com/algorandfoundation/algo-models/commit/f8773f41e974b0e1a8e7a6b83d912782c04fe134))
* omit default values entirely from msgpack ([360bbaf](https://github.com/algorandfoundation/algo-models/commit/360bbaf6518411a77d20f23bd7ab863dc3bcaa72))
* optional ([7ab9d57](https://github.com/algorandfoundation/algo-models/commit/7ab9d571b9d1699941268c43e119c9a629e43539))
* remove undefined type and simply ensure default values are never set ([ccaa64d](https://github.com/algorandfoundation/algo-models/commit/ccaa64dd66bb17f21aaf907dbe24a914a283acef))

# [1.0.0-canary.5](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.4...v1.0.0-canary.5) (2025-07-24)


### Bug Fixes

* yarn:test also ran e2e that need config, so they fail. Separate them ([a0e989a](https://github.com/algorandfoundation/algo-models/commit/a0e989a50141e9dd5838e17b1c1ff2b6214cc179))

# [1.0.0-canary.4](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.3...v1.0.0-canary.4) (2025-06-10)


### Features

* add lease length validation ([aaa1c20](https://github.com/algorandfoundation/algo-models/commit/aaa1c207192873663e6b9f561374a8ae2a7b1d63))

# [1.0.0-canary.3](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.2...v1.0.0-canary.3) (2025-05-27)


### Bug Fixes

* bytes32 and bytes64 schemas should expects exactly 32 and 64 bytes ([29807c4](https://github.com/algorandfoundation/algo-models/commit/29807c4b4eac6234e95ef933429fc8e0ab0490b0))

# [1.0.0-canary.2](https://github.com/algorandfoundation/algo-models/compare/v1.0.0-canary.1...v1.0.0-canary.2) (2025-03-12)


### Bug Fixes

* **axfer:** convert asset amount to undefined ([1cd1767](https://github.com/algorandfoundation/algo-models/commit/1cd1767cdfdc69e361ccfe8bcd48df4a73b1b76d)), closes [#24](https://github.com/algorandfoundation/algo-models/issues/24)

# 1.0.0-canary.1 (2025-02-14)


### Bug Fixes

* add const values to schemas ([c5ff5e5](https://github.com/algorandfoundation/algo-models/commit/c5ff5e5c2d778a06c08d7cc3bc0de4b6d08c896a))
* add const values to schemas ([8d3ce9e](https://github.com/algorandfoundation/algo-models/commit/8d3ce9ed803217ebd498d9ec16a6ad2c9f4d8ac8))
* add transacion type to schemas ([2a914ac](https://github.com/algorandfoundation/algo-models/commit/2a914ac23118e8fd34dd99c902411a97f1c2e1a0))
* build v0.0.2 package-lock.json ([2f3b890](https://github.com/algorandfoundation/algo-models/commit/2f3b8907cba04a26eeabdbce9aebc31afa30bc00))
* circular dependency ([4949b4d](https://github.com/algorandfoundation/algo-models/commit/4949b4dc73621cbd1b404a8c49e65281a42f9609))
* mark "type" as required in schemas ([617b34f](https://github.com/algorandfoundation/algo-models/commit/617b34ff1122c78dbfad1a203b92075e38d6810e))
* payment schema ([ea7f4f8](https://github.com/algorandfoundation/algo-models/commit/ea7f4f8a0ae30bce3c7f271d4a3e46ebd1c05e9a))
* remove demo exports ([8261f7d](https://github.com/algorandfoundation/algo-models/commit/8261f7d794399c501330b50dd141bfb256127684))


### Features

* Add computeGroupId support in Encoder ([6059348](https://github.com/algorandfoundation/algo-models/commit/60593487bfb2e2ba295bf08772efda38fae4f359))
* add the models and transaction crafter logic ([89da82e](https://github.com/algorandfoundation/algo-models/commit/89da82e1ad69ee46bf2d0e5fbce319178d969ed5))
* basic transaction models and schemas ([b431685](https://github.com/algorandfoundation/algo-models/commit/b4316859d0ae342034d1aee0689b8e68940570b8))
* provider models for signing transactions ([820d2e3](https://github.com/algorandfoundation/algo-models/commit/820d2e31fe52881f6b1b5f9780c92eadcc8bc6ac))
