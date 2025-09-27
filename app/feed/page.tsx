"use client";

import { useEffect, useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaveBackground from "../components/Background";

// simple header-like glass classes (reuse from dashboard)
const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl " +
  "backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

// Blue + pink backdrop (same as dashboard)
const Backdrop = () => (
  <div
    aria-hidden
    className="fixed inset-0 -z-10"
    style={{
      background:
        "radial-gradient(40rem 40rem at 15% 10%, #60a5fa55 0%, transparent 60%),\
         radial-gradient(32rem 32rem at 85% 15%, #f472b655 0%, transparent 65%)",
    }}
  />
);

export default function FeedPage() {
  const account = useCurrentAccount();
  const [mounted, setMounted] = useState(false);

  // Fake posts for now
  const [posts, setPosts] = useState<
    { id: number; emoji: string; message: string; visibility: string }[]
  >([]);

  useEffect(() => {
    setMounted(true);

    // placeholder posts — later replace with on-chain fetch
    setPosts([
      {
        id: 1,
        emoji: "😀",
        message: "Feeling great today, sunshine vibes!",
        visibility: "public",
      },
      {
        id: 2,
        emoji: "😢",
        message: "It’s been a rough day, but tomorrow will be better.",
        visibility: "public",
      },
      {
        id: 3,
        emoji: "🤯",
        message: "Overloaded with work but pushing through 💪",
        visibility: "public",
      },
    ]);
  }, []);

  if (!mounted) return null;

  if (!account) {
    return (
      <main className="relative mx-auto max-w-2xl px-6 pt-32 pb-20">
        <Backdrop />
        <WaveBackground />
        <div className="relative z-10">
          <Card className="bg-transparent border-0 shadow-none p-0">
            <div
              className={glassClasses + " p-4"}
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
                  <div
                    className={
                      "rounded-xl border border-white/20 bg-white/10 shadow backdrop-blur-md " +
                      "transition-colors duration-200 hover:bg-blue-400/20 px-3 py-1.5 " +
                      " [&_*]:!bg-transparent [&_*]:!shadow-none [&_*]:!ring-0 [&_*]:!border-0 " +
                      " [&_*]:!m-0 [&_*]:!p-0 [&_*]:!outline-none [&_*]:!rounded-[inherit] " +
                      " [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!border-0 " +
                      " [&>button]:!h-auto [&>button]:!w-auto [&>button]:!rounded-[inherit] " +
                      " [&_*]:!text-inherit [&_*]:!font-medium"
                    }
                  >
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
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Community Feed
          </h1>
          <p className="mt-1 text-sm">
            Browse public posts shared anonymously by others.
          </p>
        </header>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="bg-transparent border-0 shadow-none p-0"
            >
              <div
                className={glassClasses + " p-4"}
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
