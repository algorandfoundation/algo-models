# Algorand Transaction Crafting and Signing Instructions


## Steps
- Craft tx model
- msgpack (use algorand fork) encode tx with alphabetically ordered fields 
- Add byte representation of "TX" as a prefix. I.e {TAG}{msgpack encoded tx}. That is the "raw bytes"
- Sign "raw bytes" => EdDSA ( SHA512 (M))
- Attach Signature to a new model {sig, tx}
- Re-Encode {sig, tx} with msgpack(algo fork) **but** without "TX" TAG this time. These are the "ready-to-post" bytes
- REST POST with `application/x-binary` as Content-type to algod


## Data Models

### Pay Transaction Schema

The following is the JSON Schema for a Pay Transaction. The schema is:

```schema
{
  "type": "object",
  "properties": {
    "snd": {
        "type": "Uint8Array",
        "description": "Sender's public key, 32 bytes",
        "minLength": 32,
        "maxLength": 32
    },
    "rcv": {
        "type": "Uint8Array",
        "description": "Receiver's public key, 32 bytes",
        "minLength": 32,
        "maxLength": 32
    },
    "amt": {
        "type": "number",
        "description": "Amount to send, in microAlgos",
        "minimum": 0
    },
    "fee": {
        "type": "number",
        "description": "Fee to pay, in microAlgos",
        "minimum": 1000
    },
    "fv": {
        "type": "number",
        "description": "First valid round",
        "minimum": 0
    },
    "lv": {
        "type": "number",
        "description": "Last valid round",
        "minimum": 0
    },
    "gh": {
        "type": "Uint8Array",
        "description": "Genesis hash",
        "minLength": 32,
        "maxLength": 32
    },
    "gen": {
        "type": "string",
        "description": "Genesis ID"
    }
  },
  "required": [
    "snd",
    "rcv",
    "amt",
    "fee",
    "fv",
    "lv",
    "gen",
    "gh"
  ]
}
```

### Keyreg change-online Transaction Schema

The following is the JSON Schema for a Pay Transaction. The schema is:

```schema
{
  "type": "object",
  "properties": {
    "snd": {
        "type": "Uint8Array",
        "description": "Sender's public key, 32 bytes",
        "minLength": 32,
        "maxLength": 32
    },
    "fee": {
        "type": "number",
        "description": "Fee to pay, in microAlgos",
        "minimum": 1000
    },
    "fv": {
        "type": "number",
        "description": "First valid round",
        "minimum": 0
    },
    "lv": {
        "type": "number",
        "description": "Last valid round",
        "minimum": 0
    },
    "gh": {
        "type": "Uint8Array",
        "description": "Genesis hash",
        "minLength": 32,
        "maxLength": 32
    },
    "votekey": {
        "type": "Uint8Array",
        "description": "Voting key",
        "minLength": 32,
        "maxLength": 32
    },
    "selkey": {
        "type": "Uint8Array",
        "description": "Selection key",
        "minLength": 32,
        "maxLength": 32
    },
    "sprfkey": {
        "type": "Uint8Array",
        "description": "State proof key",
        "minLength": 64,
        "maxLength": 64
    },
    "votefst": {
        "type": "number",
        "description": "First participation round",
        "minimum": 0
    },
    "votelst": {
        "type": "number",
        "description": "Last participation round",
        "minimum": 0
    },
    "votekd": {
        "type": "number",
        "description": "Voting key dilution",
        "minimum": 1
    }
  },
  "required": [
    "snd",
    "fee",
    "fv",
    "lv",
    "gh",
    "votekey",
    "selkey",
    "sprfkey",
    "votefst",
    "votelst",
    "votekd"
  ]
}
```

### Keyreg change-offline Transaction Schema

The following is the JSON Schema for a Pay Transaction. The schema is:

```schema
{
  "type": "object",
  "properties": {
    "snd": {
        "type": "Uint8Array",
        "description": "Sender's public key, 32 bytes",
        "minLength": 32,
        "maxLength": 32
    },
    "fee": {
        "type": "number",
        "description": "Fee to pay, in microAlgos",
        "minimum": 1000
    },
    "fv": {
        "type": "number",
        "description": "First valid round",
        "minimum": 0
    },
    "lv": {
        "type": "number",
        "description": "Last valid round",
        "minimum": 0
    },
    "gh": {
        "type": "Uint8Array",
        "description": "Genesis hash",
        "minLength": 32,
        "maxLength": 32
    },
  },
  "required": [
    "snd",
    "fee",
    "fv",
    "lv",
    "gh"
  ]
}
```

### Keyreg non-participation Transaction Schema

The following is the JSON Schema for a Pay Transaction. The schema is:

```schema
{
  "type": "object",
  "properties": {
    "snd": {
        "type": "Uint8Array",
        "description": "Sender's public key, 32 bytes",
        "minLength": 32,
        "maxLength": 32
    },
    "fee": {
        "type": "number",
        "description": "Fee to pay, in microAlgos",
        "minimum": 1000
    },
    "fv": {
        "type": "number",
        "description": "First valid round",
        "minimum": 0
    },
    "lv": {
        "type": "number",
        "description": "Last valid round",
        "minimum": 0
    },
    "gh": {
        "type": "Uint8Array",
        "description": "Genesis hash",
        "minLength": 32,
        "maxLength": 32
    },
    "nonpart": {
        "type": "boolean",
        "description": "Set to 'true' to mark 'snd' account as not participating"
    }
  },
  "required": [
    "snd",
    "fee",
    "fv",
    "lv",
    "gh",
    "nonpart"
  ]
}
```

