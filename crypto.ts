// encrypt.ts
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SealClient, EncryptedObject, SessionKey } from "@mysten/seal";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';

const FULLNODE = getFullnodeUrl("testnet");

// Replace with verified key-server object IDs for your env.
const SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8"
];

const privateKey = "suiprivkey1qpupge5h3p905mrwxm94ksnrvmc2grn9xdx07fqfc9k4gdg33j0f2gppdtg"
const keypair = Ed25519Keypair.fromSecretKey(privateKey);

const PACKAGE_ID = "0xc5ce2742cac46421b62028557f1d7aea8a4c50f651379a79afdf12cd88628807";     // e.g. "0xabc..."
const ALLOWLIST_ID = "0x5886c514ca8013105ce2ab1599c76bfef601942428fe474e056c5320c70344b8";
const CAP_ID = "0xd29777b7690990e455e3cf8254040bda9d9d093fe5dc58933efb96a7e6af7fa2";
const ADDRESS = "0xd1a2bb83f4f3e2df6de6056952b71cd317968a80cde488ef6920a129e1b65306";
const ALLOWED_ID = "0x1e3f3f4c4e5d6f7a8b9c0d1e2f30415263748596a7b8c9d0e1f2031425364758"; // e.g. therapist address
const MODULE_NAME = "allowlist";

async function main() {
  const suiClient = new SuiClient({ url: FULLNODE });

  const client = new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((objectId) => ({ objectId, weight: 1 })),
    verifyKeyServers: false, // set true at startup if you want URL→ID verification
  });

  const data = new TextEncoder().encode("hello therapist");

  // Identity bytes (no package prefix). Here we use the patient object id bytes.

  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(ALLOWLIST_ID)
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
  console.log("Identity (hex):", id);

  const { encryptedObject: encryptedBytes, key: backupKey } = await client.encrypt({
    threshold: 2,                         // need 1 share to decryptUser
    packageId: PACKAGE_ID,
    id: id,                                   // vector<u8> identity
    data,
  });
  //console.log("Encrypted bytes (base64):", new TextDecoder().decode(encryptedBytes));
  // Optional: parse metadata if you need it later
  const parsed = EncryptedObject.parse(encryptedBytes);

  // Keep these for on-chain storage
  /*console.log(JSON.stringify({
    ciphertext_b64: new TextDecoder().decode(encryptedBytes), // base64-encoded bytes
    handle_id_hex: parsed.id,          // convenient to display/debug
    backup_key_b64: backupKey ? new TextDecoder().decode(backupKey) : null,
  }, null, 2));*/

  const sessionKey = await SessionKey.create({
    address: ADDRESS,
    packageId: PACKAGE_ID,
    ttlMin: 10, // TTL of 10 minutes
    suiClient: new SuiClient({ url: getFullnodeUrl('testnet') }),
  });
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair.signPersonalMessage(message); // User confirms in wallet
    sessionKey.setPersonalMessageSignature(signature); // Initialization complete
    
    // Create the Transaction for evaluating the seal_approve function.
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::seal_approve`, 
        arguments: [
            tx.pure.vector("u8", fromHex(id)),
            tx.object(ALLOWLIST_ID),
            // other arguments
    ]
    });  
    const txBytes = await tx.build( { client: suiClient, onlyTransactionKind: true })
    console.log("txBytes", txBytes);
    const decryptedBytes = await client.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
    });
    console.log("Decrypted bytes:", new TextDecoder().decode(decryptedBytes));

    console.log(new TextDecoder().decode(decryptedBytes)); // "hello therapist"
    console.log("OK");
}

main().catch((e) => { console.error(e); console.log("FAIL"); });
