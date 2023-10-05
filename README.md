# Algorand Transaction Crafting and Signing Instructions


## Steps
- Craft tx model
- msgpack (use algorand fork) encode tx with alphabetically ordered fields 
- Add byte representation of "TX" as a prefix. I.e {TAG}{msgpack encoded tx}. That is the "raw bytes"
- Sign "raw bytes" => EdDSA ( SHA512 (M))
- Attach Signature to a new model {sig, tx}
- Re-Encode {sig, tx} with msgpack(algo fork) **but** without "TX" TAG this time. These are the "ready-to-post" bytes
- REST POST with `application/x-binary` as Content-type to algod


## Schemas for models

Available in [schemas](./schemas) folder