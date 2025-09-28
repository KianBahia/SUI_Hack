"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WaveBackground from "../components/Background";

export default function AboutPage() {
  // blue-only backdrop (same as dashboard)
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

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 pt-28 pb-12">
      <Backdrop />
      <WaveBackground />
      <div className="relative z-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            About Healix
          </h1>
          <p className="mt-2 text-sm text-gray-800">
            Learn more about this project, its purpose, and how it works.
          </p>
        </header>

        <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-black">What is Healix?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-900">
            <p>
              Healix is a simple platform that allows users to track their
              emotions privately using blockchain technology. Connect your
              wallet to post your moods and share them publicly or keep them
              encrypted.
            </p>
            <p>
              The platform is built on Sui and emphasizes privacy, simplicity,
              and fun interactions through emojis.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-black">How to use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-900">
            <ul className="list-disc pl-5 space-y-2">
              <li>Connect your wallet using the button in the navbar.</li>
              <li>Post your current mood with a short message and emoji.</li>
              <li>Choose whether your entry is public or private.</li>
              <li>View and interact with the community.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
