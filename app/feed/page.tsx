"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaveBackground from "../components/Background";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

const Backdrop = () => (
  <div aria-hidden className="fixed inset-0 -z-10"
    style={{ background: "radial-gradient(40rem 40rem at 15% 10%, #60a5fa55 0%, transparent 60%), radial-gradient(32rem 32rem at 85% 15%, #f472b655 0%, transparent 65%)" }}
  />
);

const EMOJIS = ["😀","🙂","😐","😕","😢","😡","😴","🤒","🤯","🤪","🧘","❤️"] as const;
const EMOJI_LABELS: Record<string,string> = {
  "😀":"Happy","🙂":"Content","😐":"Neutral","😕":"Confused","😢":"Sad","😡":"Angry",
  "😴":"Tired","🤒":"Sick","🤯":"Stressed","🤪":"Crazy","🧘":"Calm","❤️":"In love",
};

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

// Ajoutez jusqu’à 10 IDs ici
const OBJECT_IDS: string[] = [
  "0xf89673a611d38f8ed38441106ac81c9339f109d420f93a3747676c5a6c3d96ea",
  "0xe74645f245a1151343c6c76296cea7172e8dd66e02218b8e6fa9e639069f7353",
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

export default function FeedPage() {
  const account = useCurrentAccount();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterEmoji, setFilterEmoji] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);

    const fetchPosts = async () => {
      const results = await Promise.allSettled(
        OBJECT_IDS.map((id) =>
          client.getObject({ id, options: { showContent: true } })
        )
      );

      const next: Post[] = results.map((res, i) => {
        const id = OBJECT_IDS[i];

        if (res.status !== "fulfilled") {
          console.warn("getObject failed", id, res.reason);
          return {
            id, emoji: "😐", message: "(indisponible)",
            visibility: "public", updatedKey: 0, status: "invalid",
            reason: "fetch_failed",
          };
        }

        const obj = res.value;
        const content = obj.data?.content as any;

        if (!content || content.dataType !== "moveObject") {
          console.warn("no moveObject content", id, obj);
          return {
            id, emoji: "😐", message: "(contenu manquant)",
            visibility: "public", updatedKey: Number(obj.data?.version ?? 0),
            status: "invalid", reason: "no_content",
          };
        }

        const fields = content.fields as { content?: string };
        if (!fields?.content) {
          console.warn("no fields.content", id, content);
          return {
            id, emoji: "😐", message: "(champ content absent)",
            visibility: "public", updatedKey: Number(obj.data?.version ?? 0),
            status: "invalid", reason: "no_fields_content",
          };
        }

        try {
          const parsed = JSON.parse(fields.content);
          const ts = parsed.timestamp != null ? Number(parsed.timestamp) : undefined;
          const versionNum = Number(obj.data?.version ?? 0);
          const updatedKey = Number.isFinite(ts) ? ts! : versionNum;

          return {
            id,
            emoji: typeof parsed.emoji === "string" ? parsed.emoji : "😐",
            message: typeof parsed.message === "string" ? parsed.message : "",
            visibility: typeof parsed.visibility === "string" ? parsed.visibility : "public",
            updatedKey,
            status: "ok",
          };
        } catch (e) {
          console.warn("invalid JSON in fields.content", id, fields.content, e);
          return {
            id, emoji: "😐", message: "(JSON invalide)",
            visibility: "public", updatedKey: Number(obj.data?.version ?? 0),
            status: "invalid", reason: "invalid_json",
          };
        }
      });

      // Trier récent → ancien, dédupliquer par id, garder 10
      const map = new Map<string, Post>();
      next
        .sort((a, b) => b.updatedKey - a.updatedKey)
        .forEach((p) => { if (!map.has(p.id)) map.set(p.id, p); });
      setPosts(Array.from(map.values()).slice(0, 10));
    };

    fetchPosts();
    timerRef.current = window.setInterval(fetchPosts, 15000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, []);

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
            <div className={glassClasses + " p-4 text-black"}
              style={{ backdropFilter: "blur(12px) saturate(1.25)", WebkitBackdropFilter: "blur(12px) saturate(1.25)" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Connect your wallet to view the feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>See what others are feeling and sharing publicly.</p>
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
          <p className="mt-1 text-sm">Browse public posts shared anonymously by others.</p>
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
              <option key={e} value={e}>{e} {EMOJI_LABELS[e]}</option>
            ))}
          </select>
        </div>

        {/* Cartes: une par ID, même si invalide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => (
            <Card key={post.id} className="bg-transparent border-0 shadow-none p-0">
              <div className={glassClasses + " p-4 text-black"}
                   style={{ backdropFilter: "blur(12px) saturate(1.25)", WebkitBackdropFilter: "blur(12px) saturate(1.25)" }}>
                <CardHeader className="pb-1 flex flex-row items-center gap-3">
                  <span className="text-2xl">{post.emoji}</span>
                  <CardTitle className="text-base">
                    {post.visibility === "public" ? "Public Post" : "Private"}
                    {post.status === "invalid" ? " • (incomplet)" : ""}
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
