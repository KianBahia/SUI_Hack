"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from "@mysten/sui/transactions";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

// Same UI style
const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl " +
  "backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

// ⚠️ Hardcoded on-chain IDs (you provided)
const PACKAGE_ID =
  "0xc5ce2742cac46421b62028557f1d7aea8a4c50f651379a79afdf12cd88628807";
const ALLOWLIST_ID =
  "0x5886c514ca8013105ce2ab1599c76bfef601942428fe474e056c5320c70344b8";
// Add your Cap object id here:
const CAP_ID =
  "0xd29777b7690990e455e3cf8254040bda9d9d093fe5dc58933efb96a7e6af7fa2"; // <-- put your real Cap object id (has key) here

// Simple address validator: 0x + 64 hex chars (normalized form)
function looksLikeAddress(s: string) {
  return /^0x[0-9a-fA-F]{64}$/.test(s.trim());
}

export default function ManageTherapistsPage() {
  // Inputs now carry THERAPIST ADDRESS (not email, not pubkey)
  const [addAddr, setAddAddr] = useState("");
  const [removeAddr, setRemoveAddr] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState<"add" | "remove" | null>(null);

  // Wallet hooks
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const addDisabled =
    !addAddr.trim() || !looksLikeAddress(addAddr) || !account || busy !== null;
  const removeDisabled =
    !removeAddr.trim() ||
    !looksLikeAddress(removeAddr) ||
    !account ||
    busy !== null;

  // Build tx for allowlist::add(&mut Allowlist, &Cap, address)
  function buildAddTx(addr: string) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${normalizeSuiAddress(PACKAGE_ID)}::allowlist::add`,
      arguments: [
        tx.object(normalizeSuiAddress(ALLOWLIST_ID)), // &mut Allowlist
        tx.object(normalizeSuiAddress(CAP_ID)),       // &Cap
        tx.pure.address(normalizeSuiAddress(addr)),   // address
      ],
    });
    return tx;
  }

  // Build tx for allowlist::remove(&mut Allowlist, &Cap, address)
  // (Assumed same signature; adjust if your Move remove differs)
  function buildRemoveTx(addr: string) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${normalizeSuiAddress(PACKAGE_ID)}::allowlist::remove`,
      arguments: [
        tx.object(normalizeSuiAddress(ALLOWLIST_ID)), // &mut Allowlist
        tx.object(normalizeSuiAddress(CAP_ID)),       // &Cap
        tx.pure.address(normalizeSuiAddress(addr)),   // address
      ],
    });
    return tx;
  }

  // Add therapist (address)
  const handleAdd = async () => {
    if (!account) return setInfo("❌ Connect a wallet first.");
    if (!looksLikeAddress(addAddr))
      return setInfo("❌ Enter a valid Sui address (0x + 64 hex characters).");

    try {
      setBusy("add");
      setInfo(null);

      const tx = buildAddTx(addAddr);
      const res = await signAndExecute(
        { transaction: tx, chain: "sui:testnet" },
        { onSuccess: (r) => console.log("add digest:", r.digest) },
      );

      setInfo(`✅ Added therapist address. Digest: ${res.digest}`);
      setAddAddr("");
    } catch (e: any) {
      console.error(e);
      setInfo(`❌ Unable to add: ${e?.message ?? e}`);
    } finally {
      setBusy(null);
    }
  };

  // Remove therapist (address)
  const handleRemove = async () => {
    if (!account) return setInfo("❌ Connect a wallet first.");
    if (!looksLikeAddress(removeAddr))
      return setInfo("❌ Enter a valid Sui address (0x + 64 hex characters).");

    try {
      setBusy("remove");
      setInfo(null);

      const tx = buildRemoveTx(removeAddr);
      const res = await signAndExecute(
        { transaction: tx, chain: "sui:testnet" },
        { onSuccess: (r) => console.log("remove digest:", r.digest) },
      );

      setInfo(`✅ Removed therapist address. Digest: ${res.digest}`);
      setRemoveAddr("");
    } catch (e: any) {
      console.error(e);
      setInfo(`❌ Unable to remove: ${e?.message ?? e}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="relative mx-auto w-full max-w-4xl px-6 pt-28 pb-12">
      {/* Background */}
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
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Manage Therapists
          </h1>
          <p className="mt-1 text-sm">
            Add or remove therapist <b>addresses</b> (0x…) to the on-chain private allowlist.
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
              {/* Add therapist */}
              <div>
                <label className="block text-sm font-medium">
                  Add Therapist (address 0x…)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    value={addAddr}
                    onChange={(e) => setAddAddr(e.target.value)}
                    placeholder="0x<64 hex chars>"
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
                {!looksLikeAddress(addAddr) && addAddr.trim() && (
                  <p className="mt-1 text-xs opacity-80">
                    Enter a valid Sui address (0x + 64 hex characters).
                  </p>
                )}
              </div>

              {/* Remove therapist */}
              <div>
                <label className="block text-sm font-medium">
                  Remove Therapist (address 0x…)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    value={removeAddr}
                    onChange={(e) => setRemoveAddr(e.target.value)}
                    placeholder="0x<64 hex chars>"
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
                {!looksLikeAddress(removeAddr) && removeAddr.trim() && (
                  <p className="mt-1 text-xs opacity-80">
                    Enter a valid Sui address (0x + 64 hex characters).
                  </p>
                )}
              </div>

              {/* Status */}
              {info && <p className="text-sm text-green-700">{info}</p>}
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  );
}
