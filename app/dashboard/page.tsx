"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Visibility = "public" | "private";

const EMOJIS = ["😀", "🙂", "😐", "😕", "😢", "😡", "😴", "🤒", "🤯", "🧘", "❤️"];

export default function DashboardPage() {
  const account = useCurrentAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!account) {
      window.location.replace("/");
    }
  }, [mounted, account]);

  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const messageChars = useMemo(() => message.trim().length, [message]);
  const canSubmit = useMemo(() => {
    if (!account) return false;
    if (!emoji) return false;
    if (messageChars === 0) return false;
    if (messageChars > 500) return false;
    return true;
  }, [account, emoji, messageChars]);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);

    if (!account) {
      setError("Connect a wallet first.");
      return;
    }
    if (!emoji) {
      setError("Pick a mood emoji.");
      return;
    }
    const body = message.trim();
    if (!body) {
      setError("Write a short message.");
      return;
    }
    if (body.length > 500) {
      setError("Message must be 500 characters or fewer.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { emoji, message: body, visibility };
      console.log("Prepared entry:", payload);
      setInfo(
        visibility === "public"
          ? "Entry ready for public publish flow."
          : "Entry ready for private encrypt-and-share flow."
      );
      setMessage("");
      setEmoji("");
      setVisibility("private");
    } catch {
      setError("Failed to prepare entry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!account) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 bg-white">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              Connect your wallet to continue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Track your feelings privately on Sui.
            </p>
            <div className="flex">
              <ConnectButton />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">New entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-900">
              How are you feeling?
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={600}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Write a short note about your current mood..."
              aria-describedby="message-hint"
            />
            <div id="message-hint" className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Up to 500 characters counted. Hard limit 600 to prevent paste overflow.</span>
              <span>{messageChars}/500</span>
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <span className="block text-sm font-medium text-gray-900">Pick a mood</span>
            <div className="mt-2 grid grid-cols-11 gap-2 sm:grid-cols-11">
              {EMOJIS.map((e) => {
                const selected = emoji === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    aria-pressed={selected}
                    className={[
                      "h-10 w-10 rounded-md border text-xl",
                      selected
                        ? "border-blue-600 ring-2 ring-blue-600"
                        : "border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                    title={e}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
            {emoji ? (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="text-base">{emoji}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No emoji selected.</p>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-900">
              Visibility
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="mt-2 w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="private">Private (encrypted)</option>
              <option value="public">Public (on-chain, anonymous)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Private encrypts locally before storing. Public stores plaintext on-chain.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="button" onClick={onSubmit} disabled={!canSubmit || submitting}>
              {submitting ? "Preparing..." : "Publish"}
            </Button>
            {!canSubmit && (
              <span className="text-sm text-gray-500">
                Connect, write a message, and pick an emoji to enable.
              </span>
            )}
          </div>

          {/* Inline status */}
          {error && <p role="status" className="text-sm text-red-600">{error}</p>}
          {info && <p role="status" className="text-sm text-green-700">{info}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
