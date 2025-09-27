"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Background from "../components/Background";

type Visibility = "public" | "private";

const EMOJIS = ["😀","🙂","😐","😕","😢","😡","😴","🤒","🤯","🧘","❤️","💀"];

const EMOJI_LABELS: Record<string, string> = {
  "😀":"Happy","🙂":"Content","😐":"Neutral","😕":"Confused","😢":"Sad","😡":"Angry",
  "😴":"Tired","🤒":"Sick","🤯":"Stressed","🧘":"Calm","❤️":"In love","💀":"Suicidal"
};

export default function DashboardPage() {
  const account = useCurrentAccount();
  const [mounted,setMounted] = useState(false);

  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    if(mounted && !account) window.location.replace("/");
  },[mounted,account]);

  const [message,setMessage] = useState("");
  const [emoji,setEmoji] = useState("");
  const [visibility,setVisibility] = useState<Visibility>("private");
  const [error,setError] = useState<string|null>(null);
  const [info,setInfo] = useState<string|null>(null);
  const [submitting,setSubmitting] = useState(false);

  const messageChars = useMemo(()=>message.trim().length,[message]);
  const canSubmit = useMemo(()=>!!account && !!emoji && messageChars>0 && messageChars<=500,[account,emoji,messageChars]);

  const onSubmit = async ()=>{
    setError(null); setInfo(null);
    if(!account) return setError("Connect a wallet first.");
    if(!emoji) return setError("Pick a mood emoji.");
    if(!message.trim()) return setError("Write a short message.");
    if(message.trim().length>500) return setError("Message must be 500 characters or fewer.");
    try {
      setSubmitting(true);
      const payload={emoji,message:message.trim(),visibility};
      console.log("Prepared entry:",payload);
      setInfo(visibility==="public"?"Entry ready for public publish flow.":"Entry ready for private encrypt-and-share flow.");
      setMessage(""); setEmoji(""); setVisibility("private");
    } catch { setError("Failed to prepare entry."); }
    finally { setSubmitting(false); }
  };

  // Apple-like liquid glass with fallbacks
  const glassBox = [
    "relative isolate overflow-hidden rounded-2xl",
    "bg-white/8 supports-[backdrop-filter:blur(0px)]:bg-white/10",
    "backdrop-blur-2xl backdrop-saturate-150",
    "border border-white/20 ring-1 ring-black/10 shadow-xl",
    "after:pointer-events-none after:absolute after:inset-px",
    "after:rounded-[calc(theme(borderRadius.2xl)-1px)]",
    "after:bg-[linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,.08))] after:opacity-70",
    "before:pointer-events-none before:absolute before:inset-[-20%] before:rounded-[40px] before:blur-2xl",
    "before:bg-[radial-gradient(60%_50%_at_20%_10%,rgba(255,255,255,.35),rgba(255,255,255,0)_70%)]",
    "no-backdrop-bg glass-reduce"
  ].join(" ");

  // tiny SVG noise (seamless)
  const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/feTurbulence%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E\")";

  if(!account){
    return (
      <main className="relative mx-auto max-w-2xl px-6 pt-32 pb-20">
        <Background/>
        <div className="relative z-10">
          <Card className={glassBox}>
            <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: NOISE, backgroundSize: "128px 128px" }}/>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl">Connect your wallet to continue</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p>Track your feelings privately on Sui.</p>
              <div className="flex"><ConnectButton/></div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-5xl px-6 pt-28 pb-12">
      <Background/>
      <div className="relative z-10">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Express your Fillings</h1>
          <p className="mt-1 text-sm">Write a short note, pick your mood, choose visibility, then publish.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: message + visibility */}
          <Card className={`md:col-span-2 ${glassBox}`}>
            <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: NOISE, backgroundSize: "128px 128px" }}/>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg">Your note</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div>
                <label htmlFor="message" className="block text-sm font-medium">How are you feeling?</label>
                <textarea
                  id="message" value={message} onChange={e=>setMessage(e.target.value)} rows={7} maxLength={600}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                  placeholder="Write a short note about your current mood..." aria-describedby="message-hint"
                />
                <div id="message-hint" className="mt-1 flex justify-between text-xs">
                  <span>Limit for publishing: 500. Hard cap 600.</span>
                  <span aria-live="polite">{messageChars}/500</span>
                </div>
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium">Visibility</label>
                <select
                  id="visibility" value={visibility} onChange={e=>setVisibility(e.target.value as Visibility)}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                >
                  <option value="private">Private (encrypted)</option>
                  <option value="public">Public (on-chain, anonymous)</option>
                </select>
                <p className="mt-2 text-xs">Private encrypts locally before storing. Public saves plaintext on-chain without personal identifiers.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" onClick={onSubmit} disabled={!canSubmit||submitting} className="rounded-xl">
                  {submitting?"Preparing...":"Publish"}
                </Button>
                {!canSubmit && <span className="text-sm">Connect, write a message, and pick an emoji to enable.</span>}
              </div>

              {error && <p role="status" className="text-sm text-red-600">{error}</p>}
              {info && <p role="status" className="text-sm text-green-700">{info}</p>}
            </CardContent>
          </Card>

          {/* Right: emoji picker */}
          <Card className={`${glassBox} md:sticky md:top-28 self-start`}>
            <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: NOISE, backgroundSize: "128px 128px" }}/>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg">Pick a mood</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div role="grid" aria-label="Emoji picker" className="grid [grid-template-columns:repeat(auto-fit,minmax(3rem,1fr))] gap-3">
                {EMOJIS.map(e=>{
                  const selected = emoji===e; const label=EMOJI_LABELS[e]??"Mood";
                  return(
                    <button key={e} type="button" onClick={()=>setEmoji(e)}
                      aria-pressed={selected} aria-label={label} title={label}
                      className={[
                        "inline-flex items-center justify-center aspect-square w-full max-w-14 rounded-xl border text-2xl transition",
                        "backdrop-blur-sm bg-white/10 border-white/20 ring-1 ring-black/10",
                        selected?"outline-none ring-2 ring-blue-500":"hover:bg-white/20",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      ].join(" ")}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 min-h-[1.25rem]">
                {emoji ? (
                  <p className="text-sm">Selected: <span className="text-base">{emoji} {EMOJI_LABELS[emoji]}</span></p>
                ) : (
                  <p className="text-sm">Nothing selected yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
