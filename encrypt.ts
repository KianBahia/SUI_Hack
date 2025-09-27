// encrypt.ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SealClient, EncryptedObject, SessionKey } from "@mysten/seal";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX } from '@mysten/sui/utils';

import { webcrypto } from "crypto";

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

const FULLNODE = getFullnodeUrl("testnet");

// Replace with verified key-server object IDs for your env.
const SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

const PATIENT_PACKAGE_ID = "0x52f9998d9212112032dc377e1377370b49b28cc0ea4435c02e358c027a15237c";     // e.g. "0xabc..."
const PATIENT_OBJECT_ID = "0x8fbf40125cc5fd106b5ef2c7f83e980fda5f4906752c42ebbeacfd064094742d";
const ADDRESS = "0xd1a2bb83f4f3e2df6de6056952b71cd317968a80cde488ef6920a129e1b65306";
const MODULE_NAME = "policy";

async function main() {
  const suiClient = new SuiClient({ url: FULLNODE });

  const client = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((objectId) => ({ objectId, weight: 1 })),
    verifyKeyServers: false, // set true at startup if you want URL→ID verification
  });

  const data = new TextEncoder().encode("hello therapist");

  // Identity bytes (no package prefix). Here we use the patient object id bytes.

  const { encryptedObject: encryptedBytes, key: backupKey } = await client.encrypt({
    threshold: 2,                         // need 2 shares to decrypt
    packageId: PATIENT_PACKAGE_ID,
    id: PATIENT_OBJECT_ID,                                   // vector<u8> identity
    data,
  });

  // Optional: parse metadata if you need it later
  const parsed = EncryptedObject.parse(encryptedBytes);

  // Keep these for on-chain storage
  console.log(JSON.stringify({
    ciphertext_b64: new TextDecoder().decode(encryptedBytes), // base64-encoded bytes
    handle_id_hex: parsed.id,          // convenient to display/debug
    backup_key_b64: backupKey ? new TextDecoder().decode(backupKey) : null,
  }, null, 2));

  const sessionKey = await SessionKey.create({
    address: ADDRESS,
    packageId: PATIENT_PACKAGE_ID,
    ttlMin: 10, // TTL of 10 minutes
    suiClient: new SuiClient({ url: getFullnodeUrl('testnet') }),
  });
    const message = sessionKey.getPersonalMessage();
    const keypair = new Ed25519Keypair();
    const { signature } = await keypair.signPersonalMessage(message); // User confirms in wallet
    sessionKey.setPersonalMessageSignature(signature); // Initialization complete

    // Create the Transaction for evaluating the seal_approve function.
    const tx = new Transaction();
    tx.moveCall({
        target: `${PATIENT_PACKAGE_ID}::${MODULE_NAME}::seal_approve`, 
        arguments: [
            tx.pure.vector("u8", fromHEX(PATIENT_OBJECT_ID)),
            // other arguments
    ]
    });  
    const txBytes = await tx.build( { client: suiClient, onlyTransactionKind: true })
    const decryptedBytes = await client.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
    });

    console.log(new TextDecoder().decode(decryptedBytes)); // "hello therapist"
}

main().catch((e) => { console.error(e); console.log("FAIL"); });
