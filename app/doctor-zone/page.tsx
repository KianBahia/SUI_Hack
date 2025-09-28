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
  console.log("OK");
}
