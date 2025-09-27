import App from "./App";

"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
// Correct path: Background.tsx sits next to this file
import Background from "./components/Background";

export default function Home() {
  const account = useCurrentAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const didRedirect = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to dashboard only once after a wallet is detected
  useEffect(() => {
    if (!mounted) return;
    if (didRedirect.current) return;
    if (account) {
      didRedirect.current = true;
      router.replace("/dashboard");
    }
  }, [mounted, account, router]);

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <Background />
      <section
        aria-labelledby="hero-title"
        className="relative z-10 max-w-3xl w-full text-center space-y-8"
      >
        <h1
          id="hero-title"
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900"
        >
          Track your feelings
        </h1>

        <p className="mx-auto max-w-2xl text-base md:text-lg text-gray-700">
          A private mood journal on Sui. Publish encrypted entries and share access securely with your therapist.
        </p>

        <div className="flex items-center justify-center">
          <ConnectButton />
        </div>

        <p className="text-xs text-gray-600">
          Uses the Sui Wallet Standard. You control your keys.
        </p>
      </section>
    </main>
  );
}
