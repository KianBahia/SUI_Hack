"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const glassClasses =
  "rounded-2xl border border-white/20 bg-white/10 shadow-xl " +
  "backdrop-blur-md supports-[backdrop-filter:blur(0px)]:bg-white/10";

export default function ManageTherapistsPage() {
  const [addEmail, setAddEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);

  const handleAdd = () => {
    if (!addEmail.trim()) return;
    console.log("Adding therapist:", addEmail);
    setInfo(`Therapist with email "${addEmail}" added successfully.`);
    setAddEmail("");
  };

  const handleRemove = () => {
    if (!removeEmail.trim()) return;
    console.log("Removing therapist:", removeEmail);
    setInfo(`Therapist with email "${removeEmail}" removed successfully.`);
    setRemoveEmail("");
  };

  return (
    <main className="relative mx-auto w-full max-w-4xl px-6 pt-28 pb-12">
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
            Add or remove therapists from the system by entering their email.
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
                  Add Therapist (email)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="Enter therapist email"
                    className="rounded-xl border border-grey/40 bg-white/5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleAdd}
                    className="rounded-xl h-full"
                    disabled={!addEmail.trim()}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Remove therapist field */}
              <div>
                <label className="block text-sm font-medium">
                  Remove Therapist (email)
                </label>
                <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
                  <input
                    type="email"
                    value={removeEmail}
                    onChange={(e) => setRemoveEmail(e.target.value)}
                    placeholder="Enter therapist email"
                    className="rounded-xl border border-grey/40 bg-white/5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleRemove}
                    className="rounded-xl h-full bg-red-600 hover:bg-red-700"
                    disabled={!removeEmail.trim()}
                  >
                    -
                  </Button>
                </div>
              </div>

              {info && <p className="text-sm text-green-700">{info}</p>}
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  );
}
