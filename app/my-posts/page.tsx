"use client";

import { useEffect } from "react";
import WaveBackground from "../components/Background";
import { SessionKey } from "@mysten/seal";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
// -------------------------------------------------------------

const glass =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

const Backdrop = () => (
  <div
    aria-hidden
    className="fixed inset-0 -z-10"
    style={{
      background:
        "radial-gradient(40rem 40rem at 15% 10%, #60a5fa55 0%, transparent 60%), radial-gradient(32rem 32rem at 85% 15%, #f472b655 0%, transparent 65%)",
    }}
  />
);

export default function MyPostsPage() {
  useEffect(() => {
    // wrap awaits in an async IIFE
    (async () => {
      try {
        await parsePosts();
        console.log("[MyPosts] page mounted");
      } catch (e) {
        console.error("[MyPosts] init failed", e);
      }
    })();
  }, []);

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 pt-28 pb-12">
      <Backdrop />
      <WaveBackground />
      <div className="relative z-10">
        <div
          className={glass + " p-6 text-black"}
          style={{
            backdropFilter: "blur(12px) saturate(1.25)",
            WebkitBackdropFilter: "blur(12px) saturate(1.25)",
          }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">My Posts</h1>
          <p className="mt-2 text-sm">Work in progress.</p>
        </div>
      </div>
    </main>
  );
}

async function parsePosts() {
  const address = useCurrentAccount()?.address;
  const package_id = "0xa68d4253a03fb858b97ca8b0e0cb6383d2394a549a9b3cf9b1bbb7f1a1b936ae";
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  if (!address) {
    console.warn("No connected wallet");
    return;
  }

  const sessionKey = await SessionKey.create({
    address: address,
    packageId: package_id,
    ttlMin: 10, // TTL of 10 minutes
    suiClient: new SuiClient({ url: getFullnodeUrl('testnet') }),
  });
  const message = sessionKey.getPersonalMessage();
  const { signature } = await signPersonalMessage({ message }); // User confirms in wallet
  sessionKey.setPersonalMessageSignature(signature); // Initialization complete

  // Create the Transaction for evaluating the seal_approve function.
  const tx = new Transaction();
  tx.moveCall({
      target: `${package_id}::${MODULE_NAME}::seal_approve`, 
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
