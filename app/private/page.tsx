"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useCurrentAccount, ConnectButton, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaveBackground from "../components/Background";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, toHex } from "@mysten/sui/utils";

const glassClasses =
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

const EMOJIS = ["😀","🙂","😐","😕","😢","😡","😴","🤒","🤯","🤪","🧘","❤️"] as const;
const EMOJI_LABELS: Record<string, string> = {
  "😀": "Happy", "🙂": "Content", "😐": "Neutral", "😕": "Confused",
  "😢": "Sad", "😡": "Angry", "😴": "Tired", "🤒": "Sick",
  "🤯": "Stressed", "🤪": "Crazy", "🧘": "Calm", "❤️": "In love",
};

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

// DATABASE
const DATABASE_OBJECT_ID = "0x3c8d988415c83935f3f015da30716c331b4226acc3643d94bbfc9d66bbcab310";

// SEAL / POLICY CONSTANTS (from your snippet)
const PACKAGE_ID = "0xc5ce2742cac46421b62028557f1d7aea8a4c50f651379a79afdf12cd88628807";
const POLICY_OBJECT_ID = "0x5886c514ca8013105ce2ab1599c76bfef601942428fe474e056c5320c70344b8";
const KEY_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

type Post = {
  id: string;
  emoji: string;
  message: string;
  visibility: string;
  updatedKey: number;
  status: "ok" | "invalid";
  reason?: string;
};

// --- helpers that do NOT use hooks ---

async function buildSealClient() {
  return new SealClient({
    suiClient,
    serverConfigs: KEY_SERVER_OBJECT_IDS.map((objectId) => ({ objectId, weight: 1 })),
    verifyKeyServers: false,
  });
}

async function initSessionKey(
  address: string,
  signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>,
) {
  const sessionKey = await SessionKey.create({
    address,
    packageId: PACKAGE_ID,
    ttlMin: 10,
    suiClient,
  });
  const message = sessionKey.getPersonalMessage();
  const { signature } = await signPersonalMessage({ message });
  sessionKey.setPersonalMessageSignature(signature);
  return sessionKey;
}

async function buildSealApproveTxBytes(idBytes: Uint8Array) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::allowlist::seal_approve`,
    arguments: [
      tx.pure.vector("u8", idBytes),
      tx.object(POLICY_OBJECT_ID),
      // add any extra required args here if your Move function needs them
    ],
  });
  return tx.build({ client: suiClient, onlyTransactionKind: true });
}

function hexToBytesLoose(s: string): Uint8Array {
  const clean = s.startsWith("0x") ? s : `0x${s}`;
  return fromHex(clean);
}

async function tryDecryptContent(
  encryptedHex: string,
  sessionKey: SessionKey,
  sealClient: SealClient,
): Promise<Uint8Array> {
  // identity = policy_object_id bytes + random nonce (same shape as your snippet)
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyBytes = hexToBytesLoose(POLICY_OBJECT_ID);
  const idBytes = new Uint8Array(policyBytes.length + nonce.length);
  idBytes.set(policyBytes, 0);
  idBytes.set(nonce, policyBytes.length);

  const txBytes = await buildSealApproveTxBytes(idBytes);

  const ciphertext = hexToBytesLoose(encryptedHex);
  // retry like your encrypt loop
  let attempts = 0;
  let lastErr: unknown = null;
  while (attempts < 100) {
    try {
      const plain = await sealClient.decrypt({
        data: ciphertext,
        sessionKey,
        txBytes,
      });
      return plain;
    } catch (e) {
      lastErr = e;
      attempts++;
    }
  }
  throw lastErr ?? new Error("decrypt failed");
}

// parse logic: try JSON, else treat as plaintext message
function parsePostPayload(text: string): { emoji: string; message: string; visibility: string } {
  try {
    const parsed = JSON.parse(text);
    return {
      emoji: typeof parsed.emoji === "string" ? parsed.emoji : "😐",
      message: typeof parsed.message === "string" ? parsed.message : "",
      visibility: typeof parsed.visibility === "string" ? parsed.visibility : "public",
    };
  } catch {
    return { emoji: "😐", message: text, visibility: "public" };
  }
}

// --- component ---

export default function FeedPage() {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterEmoji, setFilterEmoji] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const decryptIfNeeded = useCallback(
    async (raw: string, sessionKey: SessionKey, sealClient: SealClient) => {
      // heuristics: hex with even length → try decrypt first
      const maybeHex = raw.replace(/^0x/, "");
      const looksHex = /^[0-9a-fA-F]+$/.test(maybeHex) && maybeHex.length % 2 === 0 && maybeHex.length > 20;
      if (!looksHex) return raw;

      try {
        const bytes = await tryDecryptContent(raw, sessionKey, sealClient);
        return new TextDecoder().decode(bytes);
      } catch {
        // fall back to original if decrypt fails
        return raw;
      }
    },
    [],
  );

  useEffect(() => {
    if (!account?.address) return;

    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const sealClient = await buildSealClient();
        const sessionKey = await initSessionKey(account.address, signPersonalMessage);

        // 1) fetch db
        const dbRes = await suiClient.getObject({ id: DATABASE_OBJECT_ID, options: { showContent: true } });
        const content = dbRes.data?.content as any;
        if (!content || content.dataType !== "moveObject") return;

        const notes: any[] = content.fields?.notes || [];
        if (!Array.isArray(notes)) return;

        const OBJECT_IDS: string[] = notes.slice(-10).map((n) => n.fields.note_id);

        // 2) fetch each object
        const results = await Promise.allSettled(
          OBJECT_IDS.map((id) => suiClient.getObject({ id, options: { showContent: true } })),
        );

        const next: Post[] = [];
        for (let i = 0; i < results.length; i++) {
          const id = OBJECT_IDS[i];
          const r = results[i];
          if (r.status !== "fulfilled") {
            next.push({
              id,
              emoji: "😐",
              message: "(unavailable)",
              visibility: "public",
              updatedKey: 0,
              status: "invalid",
              reason: "fetch_failed",
            });
            continue;
          }

          const obj = r.value;
          const mo = obj.data?.content as any;
          const versionNum = Number(obj.data?.version ?? 0);

          if (!mo || mo.dataType !== "moveObject") {
            next.push({
              id,
              emoji: "😐",
              message: "(no content)",
              visibility: "public",
              updatedKey: versionNum,
              status: "invalid",
              reason: "no_content",
            });
            continue;
          }

          const fields = mo.fields as { content?: string };
          if (!fields?.content || typeof fields.content !== "string") {
            next.push({
              id,
              emoji: "😐",
              message: "(missing content field)",
              visibility: "public",
              updatedKey: versionNum,
              status: "invalid",
              reason: "no_fields_content",
            });
            continue;
          }

          // decrypt-or-parse
          const decryptedText = await decryptIfNeeded(fields.content, sessionKey, sealClient);
          const parsed = parsePostPayload(decryptedText);
          const ts = (() => {
            try {
              const j = JSON.parse(decryptedText);
              return j && j.timestamp != null ? Number(j.timestamp) : undefined;
            } catch {
              return undefined;
            }
          })();
          const updatedKey = Number.isFinite(ts) ? (ts as number) : versionNum;

          // keep all posts; if you still want only public, keep the guard below
          // if (parsed.visibility !== "public") continue;

          next.push({
            id,
            emoji: parsed.emoji,
            message: parsed.message,
            visibility: parsed.visibility,
            updatedKey,
            status: "ok",
          });
        }

        // sort and dedupe
        const map = new Map<string, Post>();
        next
          .sort((a, b) => b.updatedKey - a.updatedKey)
          .forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });

        if (!cancelled) setPosts(Array.from(map.values()).slice(0, 10));
      } catch (err) {
        console.error("feed fetch failed:", err);
      }
    };

    fetchPosts();
    timerRef.current = window.setInterval(fetchPosts, 15000);
    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [account?.address, signPersonalMessage, decryptIfNeeded]);

  const filtered = useMemo(() => {
    if (!filterEmoji) return posts;
    return posts.filter((p) => p.emoji === filterEmoji);
  }, [posts, filterEmoji]);

  if (!mounted) return null;

  if (!account) {
    return (
      <main className="relative mx-auto max-w-2xl px-6 pt-32 pb-20">
        <Backdrop />
        <WaveBackground />
        <div className="relative z-10">
          <Card className="bg-transparent border-0 shadow-none p-0">
            <div
              className={glassClasses + " p-4 text-black"}
              style={{ backdropFilter: "blur(12px) saturate(1.25)", WebkitBackdropFilter: "blur(12px) saturate(1.25)" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Connect your wallet to view the feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>See what others are feeling and sharing.</p>
                <div className="flex">
                  <div className="rounded-xl border border-white/20 bg-white/10 shadow backdrop-blur-md px-3 py-1.5 text-black">
                    <ConnectButton />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-4xl px-6 pt-28 pb-12">
      <Backdrop />
      <WaveBackground />
      <div className="relative z-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Community Feed</h1>
          <p className="mt-1 text-sm">Decrypted when possible using your session.</p>
        </header>

        <div className={glassClasses + " p-4 flex items-center gap-3 text-black"}>
          <label className="text-sm font-medium">Filter by mood:</label>
          <select
            className="rounded-xl border border-gray-300 bg-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm text-black"
            value={filterEmoji}
            onChange={(e) => setFilterEmoji(e.target.value)}
          >
            <option value="">All</option>
            {EMOJIS.map((e) => (
              <option key={e} value={e}>
                {e} {EMOJI_LABELS[e]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => (
            <Card key={post.id} className="bg-transparent border-0 shadow-none p-0">
              <div
                className={glassClasses + " p-4 text-black"}
                style={{ backdropFilter: "blur(12px) saturate(1.25)", WebkitBackdropFilter: "blur(12px) saturate(1.25)" }}
              >
                <CardHeader className="pb-1 flex flex-row items-center gap-3">
                  <span className="text-2xl">{post.emoji}</span>
                  <CardTitle className="text-base">
                    {post.visibility === "public" ? "Public Post" : "Private"}
                    {post.status === "invalid" ? " • (incomplete)" : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.message}</p>
                  <p className="mt-2 text-xs opacity-70">ID: {post.id.slice(0, 10)}… • key {post.updatedKey}</p>
                </CardContent>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className={glassClasses + " p-6 text-sm text-black"}>No posts match the current filter.</div>
          )}
        </div>
      </div>
    </main>
  );
}
