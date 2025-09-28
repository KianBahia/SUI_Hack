"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, normalizeSuiAddress } from "@mysten/sui/utils";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

// Glassmorphism style (unchanged)
const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl " +
  "backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

// 🔒 Hardcoded on-chain IDs you provided
const ALLOWLIST_ID =
  "0x5886c514ca8013105ce2ab1599c76bfef601942428fe474e056c5320c70344b8";
const PACKAGE_ID =
  "0xc5ce2742cac46421b62028557f1d7aea8a4c50f651379a79afdf12cd88628807";

// Helpers
function is0xHex(str: string) {
  return /^0x[0-9a-fA-F]+$/.test(str.trim());
}
function ensureEvenHex(str: string) {
  // Make sure hex length (without 0x) is even so it can be parsed to bytes
  const body = str.replace(/^0x/, "");
  return body.length % 2 === 0 ? str : ("0x" + "0" + body);
}

export default function ManageTherapistsPage() {
  // Text inputs now carry the therapist PUBLIC KEY (0x-hex), not email.
  const [addPubkey, setAddPubkey] = useState("");
  const [removePubkey, setRemovePubkey] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState<"add" | "remove" | null>(null);

  // Wallet hooks (the page expects you already wrapped the app with <SuiClientProvider> and <WalletProvider>)
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  // Basic UI validation & affordances
  const canUseWallet = !!account;
  const addDisabled =
    !addPubkey.trim() || !is0xHex(addPubkey) || !canUseWallet || busy !== null;
  const removeDisabled =
    !removePubkey.trim() ||
    !is0xHex(removePubkey) ||
    !canUseWallet ||
    busy !== null;

  // Build a move call with a therapist public key as vector<u8>
  function buildAddTx(pubkeyHex: string) {
    const tx = new Transaction();
    const safe = ensureEvenHex(pubkeyHex.trim());
    const pubkeyBytes = fromHex(safe.replace(/^0x/, ""));

    tx.moveCall({
      target: `${normalizeSuiAddress(PACKAGE_ID)}::allowlist::add`,
      arguments: [
        tx.object(normalizeSuiAddress(ALLOWLIST_ID)),
        tx.pure.vector("u8", Array.from(pubkeyBytes)), // therapist public key as bytes
      ],
    });

    return tx;
  }

  function buildRemoveTx(pubkeyHex: string) {
    const tx = new Transaction();
    const safe = ensureEvenHex(pubkeyHex.trim());
    const pubkeyBytes = fromHex(safe.replace(/^0x/, ""));

    tx.moveCall({
      target: `${normalizeSuiAddress(PACKAGE_ID)}::allowlist::remove`,
      arguments: [
        tx.object(normalizeSuiAddress(ALLOWLIST_ID)),
        tx.pure.vector("u8", Array.from(pubkeyBytes)), // therapist public key as bytes
      ],
    });

    return tx;
  }

  // Add therapist (public key)
  const handleAdd = async () => {
    if (!account) {
      setInfo("❌ Connect a wallet first.");
      return;
    }
    if (!is0xHex(addPubkey)) {
      setInfo("❌ Enter a 0x-prefixed public key hex.");
      return;
    }

    try {
      setBusy("add");
      setInfo(null);

      const tx = buildAddTx(addPubkey);
      const result = await signAndExecute(
        {
          transaction: tx,
          chain: "sui:testnet",
        },
        {
          // Optional callbacks
          onSuccess: (res) => {
            console.log("Executed add, effects digest:", res?.digest);
          },
        },
      );

      setInfo(
        `Therapist public key added ✅ (digest: ${result.digest ?? "unknown"})`,
      );
      setAddPubkey("");
    } catch (err: any) {
      console.error("Add failed:", err);
      setInfo(`❌ Error adding therapist: ${err?.message ?? err}`);
    } finally {
      setBusy(null);
    }
  };

  // Remove therapist (public key)
  const handleRemove = async () => {
    if (!account) {
      setInfo("❌ Connect a wallet first.");
      return;
    }
    if (!is0xHex(removePubkey)) {
      setInfo("❌ Enter a 0x-prefixed public key hex.");
      return;
    }

    try {
      setBusy("remove");
      setInfo(null);

      const tx = buildRemoveTx(removePubkey);
      const result = await signAndExecute(
        {
          transaction: tx,
          chain: "sui:testnet",
        },
        {
          onSuccess: (res) => {
            console.log("Executed remove, effects digest:", res?.digest);
          },
        },
      );

      setInfo(
        `Therapist public key removed ✅ (digest: ${result.digest ?? "unknown"})`,
      );
      setRemovePubkey("");
    } catch (err: any) {
      console.error("Remove failed:", err);
      setInfo(`❌ Error removing therapist: ${err?.message ?? err}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="relative mx-auto w-full max-w-4xl px-6 pt-28 pb-12">
      {/* Background gradient */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40rem 40rem at 15% 10%, #60a5fa55 0%, transparent 60%),\
             radial-gradient(32rem 32rem at 85% 15%, #f472b655 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10">
        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Manage Therapists
          </h1>
          <p className="mt-1 text-sm">
            Add or remove therapists from the on-chain private allowlist using
            their <b>public key</b> (0x-hex).
          </p>
        </header>

        <Card className="bg-transparent border-0 shadow-none p-0">
          <div
            className={glassClasses + " p-4 space-y-6"}
            style={{
              backdropFilter: "blur(14px) saturate(1.3)",
              WebkitBackdropFilter: "blur(14px) saturate(1.3)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add therapist field */}
              <div>
                <label className="block text-sm font-medium">
                  Add Therapist (public key 0x-hex)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    value={addPubkey}
                    onChange={(e) => setAddPubkey(e.target.value)}
                    placeholder="0x<public key hex>"
                    className="rounded-xl border border-grey/40 bg-white/5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleAdd}
                    className="rounded-xl h-full"
                    disabled={addDisabled}
                    title={!account ? "Connect a wallet" : ""}
                  >
                    +
                  </Button>
                </div>
                {!is0xHex(addPubkey) && addPubkey.trim() && (
                  <p className="mt-1 text-xs opacity-80">
                    Enter a 0x-prefixed public key hex.
                  </p>
                )}
              </div>

              {/* Remove therapist field */}
              <div>
                <label className="block text-sm font-medium">
                  Remove Therapist (public key 0x-hex)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    value={removePubkey}
                    onChange={(e) => setRemovePubkey(e.target.value)}
                    placeholder="0x<public key hex>"
                    className="rounded-xl border border-grey/40 bg-white/5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleRemove}
                    className="rounded-xl h-full bg-red-600 hover:bg-red-700"
                    disabled={removeDisabled}
                    title={!account ? "Connect a wallet" : ""}
                  >
                    -
                  </Button>
                </div>
                {!is0xHex(removePubkey) && removePubkey.trim() && (
                  <p className="mt-1 text-xs opacity-80">
                    Enter a 0x-prefixed public key hex.
                  </p>
                )}
              </div>

              {/* Info message */}
              {info && <p className="text-sm text-green-700">{info}</p>}
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  );
}
