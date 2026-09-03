"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function OverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apiKeysSet, setApiKeysSet] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const meta = user.user_metadata ?? {};
      if (!meta.username) {
        window.location.href = "/onboarding";
        return;
      }
      setUser(user);
      setApiKeysSet(!!(meta.gemini_api_key || meta.openai_api_key || meta.anthropic_api_key));
    });
  }, []);

  const features = [
    {
      index: "01",
      title: "Identity & Session",
      body: user
        ? `Signed in as ${user.email}. This secure session is valid across Atlas and Metaphor via the unified Supabase layer.`
        : "Loading session...",
      status: !!user,
      statusLabel: user ? "Secure" : "Syncing",
      href: null,
      cta: null,
    },
    {
      index: "02",
      title: "Universal API Keys",
      body: apiKeysSet
        ? "Your API keys are encrypted in your sovereign profile. All ecosystem apps read them dynamically."
        : "No keys saved. Set them once and every tool picks them up automatically without .env files.",
      status: apiKeysSet,
      statusLabel: apiKeysSet ? "Configured" : "Not set",
      href: "/settings",
      cta: "Manage keys",
    },
    {
      index: "03",
      title: "Active Continuity",
      body: "Drafting 'System Architecture V3' in Metaphor. Open Atlas to instantly inject this context into your design canvas.",
      status: true,
      statusLabel: "Live Context",
      href: "http://localhost:5173",
      cta: "Resume in Atlas",
    },
    {
      index: "04",
      title: "Orion Handoff",
      body: "Scan a secure QR code to instantly push your active session to Orion on your Redmi 14C. Zero re-login friction.",
      status: false,
      statusLabel: "Ready",
      href: "/devices",
      cta: "Pair device",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 pb-32">
      
      {/* Hero Section */}
      <div className="animate-fade-in mb-16 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-muted mb-4 inline-block">
          Pseudonyms Sovereign ID
        </span>
        <h1 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight">
          {user ? `Welcome back, ${user.user_metadata?.username || user.email?.split("@")[0]}.` : "Initializing Workspace..."}
        </h1>
        <p className="text-base text-muted max-w-lg mx-auto leading-relaxed">
          The central cognitive context and identity layer across your entire multi-agent ecosystem.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="flex flex-col gap-6">
        {features.map((f, i) => (
          <div
            key={f.index}
            className={`animate-slide-up bg-surface-2 hover:bg-surface-3 shadow-card hover:shadow-card-hover border border-border-subtle p-8 grid grid-cols-[auto_1fr_auto] gap-6 items-start rounded-2xl transition-all`}
            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'both' }}
          >
            {/* Index Badge */}
            <div className="w-10 h-10 rounded-xl bg-surface-1 border border-border-strong flex items-center justify-center text-foreground">
              <span className="font-mono text-xs">{f.index}</span>
            </div>

            {/* Content */}
            <div className="pt-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-base font-semibold text-foreground m-0">
                  {f.title}
                </h2>
                
                {/* Status Pill */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                  f.status 
                    ? "bg-neon-emerald/10 border-neon-emerald/20" 
                    : "bg-surface-1 border-border-strong"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${f.status ? "bg-neon-emerald shadow-glow-em" : "bg-muted"}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${f.status ? "text-neon-emerald" : "text-muted"}`}>
                    {f.statusLabel}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted leading-relaxed m-0">
                {f.body}
              </p>

              {f.href && f.cta && (
                <Link
                  href={f.href}
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {f.cta}
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
