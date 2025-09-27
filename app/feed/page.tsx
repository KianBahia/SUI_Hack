"use client";

import { useEffect, useState, useMemo } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaveBackground from "../components/Background";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Glassy card styling
const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

// Blue + pink backdrop
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

const EMOJIS = [
  "😀",
  "🙂",
  "😐",
  "😕",
  "😢",
  "😡",
  "😴",
  "🤒",
  "🤯",
  "🤪",
  "🧘",
  "❤️",
];

const EMOJI_LABELS: Record<string, string> = {
  "😀": "Happy",
  "🙂": "Content",
  "😐": "Neutral",
  "😕": "Confused",
  "😢": "Sad",
  "😡": "Angry",
  "😴": "Tired",
  "🤒": "Sick",
  "🤯": "Stressed",
  "🤪": "Crazy",
  "🧘": "Calm",
  "❤️": "In love",
};

// ✅ connect to Sui testnet
const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export default function FeedPage() {
  const account = useCurrentAccount();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<
    { id: string; emoji: string; message: string; visibility: string }[]
  >([]);
  const [filterEmoji, setFilterEmoji] = useState<string>("");

  useEffect(() => {
    setMounted(true);

    const fetchPosts = async () => {
      const objectIds = [
        // ✅ add all object IDs you want to display
        "0xf89673a611d38f8ed38441106ac81c9339f109d420f93a3747676c5a6c3d96ea",
      ];

      try {
        const results = await Promise.all(
          objectIds.map((id) =>
            client.getObject({
              id,
              options: { showContent: true },
            }),
          ),
        );

        const parsedPosts = results
          .map((object, i) => {
            if (
              object.data?.content &&
              "dataType" in object.data.content &&
              object.data.content.dataType === "moveObject"
            ) {
              const fields = object.data.content.fields as {
                content?: string;
              };

              if (fields.content) {
                try {
                  const parsed = JSON.parse(fields.content);
                  return {
                    id: objectIds[i],
                    emoji: parsed.emoji ?? "😐",
                    message: parsed.message ?? "",
                    visibility: parsed.visibility ?? "public",
                  };
                } catch (e) {
                  console.warn(
                    "Invalid JSON for",
                    objectIds[i],
                    fields.content,
                  );
                  return null;
                }
              }
            }
            return null;
          })
          .filter(
            (
              p,
            ): p is {
              id: string;
              emoji: string;
              message: string;
              visibility: string;
            } => p !== null,
          );

        setPosts(parsedPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!filterEmoji) return posts;
    return posts.filter((post) => post.emoji === filterEmoji);
  }, [filterEmoji, posts]);

  if (!mounted) return null;

  // Show connect wallet screen
  if (!account) {
    return (
      <main className="relative mx-auto max-w-2xl px-6 pt-32 pb-20">
        <Backdrop />
        <WaveBackground />
        <div className="relative z-10">
          <Card className="bg-transparent border-0 shadow-none p-0">
            <div
              className={glassClasses + " p-4 text-black"}
              style={{
                backdropFilter: "blur(12px) saturate(1.25)",
                WebkitBackdropFilter: "blur(12px) saturate(1.25)",
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  Connect your wallet to view the feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>See what others are feeling and sharing publicly.</p>
                <div className="flex">
                  <div className="rounded-xl border border-white/20 bg-white/10 shadow backdrop-blur-md transition-colors duration-200 hover:bg-blue-400/20 px-3 py-1.5 text-black">
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

  // Show feed
  return (
    <main className="relative mx-auto w-full max-w-4xl px-6 pt-28 pb-12">
      <Backdrop />
      <WaveBackground />
      <div className="relative z-10 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Community Feed
          </h1>
          <p className="mt-1 text-sm">
            Browse public posts shared anonymously by others.
          </p>
        </header>

        {/* Emoji Filter */}
        <div
          className={glassClasses + " p-4 flex items-center gap-3 text-black"}
        >
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

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-transparent border-0 shadow-none p-0"
            >
              <div
                className={glassClasses + " p-4 text-black"}
                style={{
                  backdropFilter: "blur(12px) saturate(1.25)",
                  WebkitBackdropFilter: "blur(12px) saturate(1.25)",
                }}
              >
                <CardHeader className="pb-1 flex flex-row items-center gap-3">
                  <span className="text-2xl">{post.emoji}</span>
                  <CardTitle className="text-base">
                    {post.visibility === "public" ? "Public Post" : "Private"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{post.message}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
