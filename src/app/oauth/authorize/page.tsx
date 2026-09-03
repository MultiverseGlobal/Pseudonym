"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, Check, ArrowRight } from "lucide-react";
import { ECOSYSTEM_APPS } from "@/lib/ecosystem";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

function AuthorizeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const clientId = searchParams.get("client_id") || "metaphor";
  const redirectUri = searchParams.get("redirect_uri") || "http://localhost:3000/auth/callback";
  const state = searchParams.get("state") || "";

  const app = ECOSYSTEM_APPS.find((a) => a.id === clientId) || ECOSYSTEM_APPS[0];
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleApprove = async () => {
    setApproving(true);
    
    const { data } = await createClient().auth.getSession();
    const session = data.session;
    
    setTimeout(() => {
      const target = new URL(redirectUri);
      if (session) {
        target.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=recovery`;
      } else {
        target.searchParams.set("error", "no_session");
      }
      if (state) target.searchParams.set("state", state);
      window.location.href = target.toString();
    }, 800);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-1 rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-card space-y-6">
        
        {/* App connection header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-border-strong p-[1px] shadow-glow-sm">
            <div className="w-full h-full rounded-2xl bg-surface-2 flex items-center justify-center">
              <Shield className="w-7 h-7 text-foreground" />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold text-foreground font-display">Authorize Access</h1>
            <p className="text-xs text-muted font-mono mt-1">
              <span className="text-foreground font-semibold">{app.name}</span> wants to connect to your Master Pseudonyms ID
            </p>
          </div>
        </div>

        {/* Master account info */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center font-bold text-xs text-foreground">
              {user?.email?.slice(0, 2).toUpperCase() ?? "??"}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{user?.email?.split("@")[0] ?? "—"}</p>
              <p className="text-2xs text-muted font-mono">{user?.email ?? "—"}</p>
            </div>
          </div>
          <span className="text-2xs font-mono text-neon-emerald px-2 py-0.5 rounded bg-neon-emerald/10 border border-neon-emerald/20">
            Sovereign
          </span>
        </div>

        {/* Permissions list */}
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase text-muted tracking-wider">Requested Privileges:</p>
          <div className="space-y-1.5">
            {app.permissions.map((perm) => (
              <div key={perm} className="flex items-center gap-2 text-xs text-foreground/80">
                <Check className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span className="font-mono text-2xs">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-foreground text-sm font-semibold shadow-glow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{approving ? "Exchanging Tokens..." : "Allow & Unlock Application"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Deny Access & Return
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Loading master identity...</div>}>
      <AuthorizeForm />
    </Suspense>
  );
}
