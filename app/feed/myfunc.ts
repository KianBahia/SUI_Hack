import { useCallback, useMemo, useState } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { SessionKey, SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/bcs";

const OBJECT_IDS = ["..."]; // replace with your server object IDs
const POLICY_OBJECT_ID =
  "0x5886c514ca8013105ce2ab1599c76bfef601942428fe474e056c5320c70344b8";
const PACKAGE_ID =
  "0xc5ce2742cac46421b62028557f1d7aea8a4c50f651379a79afdf12cd88628807";

async function tryDecrypt(
  client: SealClient,
  encryptedMessage: string,
  sessionKey: SessionKey,
  txBytes: Uint8Array,
  retries = 3,
): Promise<Uint8Array> {
  for (let i = 0; i < retries; i++) {
    try {
      return await client.decrypt({
        data: fromHex(encryptedMessage),
        sessionKey,
        txBytes,
      });
    } catch (err) {
      console.warn(`Decrypt attempt ${i + 1} failed`, err);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000)); // backoff
    }
  }
  throw new Error("All decrypt attempts failed");
}

export function useDecrypt() {
  const { address } = useCurrentAccount() ?? {};
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const suiClient = useMemo(
    () => new SuiClient({ url: getFullnodeUrl("testnet") }),
    [],
  );

  const sealClient = useMemo(
    () =>
      new SealClient({
        suiClient,
        serverConfigs: OBJECT_IDS.map((objectId) => ({ objectId, weight: 1 })),
        verifyKeyServers: false,
      }),
    [suiClient],
  );

  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decrypt = useCallback(
    async (encryptedMessage: string) => {
      try {
        if (!address) throw new Error("No connected account");

        // 🔑 Create Session Key
        const sessionKey = await SessionKey.create({
          address,
          packageId: PACKAGE_ID,
          ttlMin: 10,
          suiClient,
        });

        const message = sessionKey.getPersonalMessage();
        const { signature } = await signPersonalMessage({ message });
        sessionKey.setPersonalMessageSignature(signature);

        // 📦 Build transaction
        const nonce = crypto.getRandomValues(new Uint8Array(5));
        const policyObjectBytes = fromHex(POLICY_OBJECT_ID);
        const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::allowlist::seal_approve`,
          arguments: [
            tx.pure.vector("u8", fromHex(id)),
            tx.object(POLICY_OBJECT_ID),
          ],
        });

        const txBytes = await tx.build({
          client: suiClient,
          onlyTransactionKind: true,
        });

        // 🔓 Attempt decryption with retry
        const decryptedBytes = await tryDecrypt(
          sealClient,
          encryptedMessage,
          sessionKey,
          txBytes,
          3,
        );

        const out = new TextDecoder().decode(decryptedBytes);
        setDecrypted(out);
        setError(null);

        return out;
      } catch (err: any) {
        console.error("Decryption failed:", err);
        setError(err.message);
        setDecrypted(null);
        throw err;
      }
    },
    [address, signPersonalMessage, suiClient, sealClient],
  );

  return { decrypt, decrypted, error };
}
