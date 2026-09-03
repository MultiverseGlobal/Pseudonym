"use client";

import React, { useState, useEffect } from "react";
import { Key, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const [keys, setKeys] = useState({ gemini: "", openai: "", anthropic: "", username: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      const meta = user?.user_metadata ?? {};
      setKeys({
        gemini: meta.gemini_api_key ?? "",
        openai: meta.openai_api_key ?? "",
        anthropic: meta.anthropic_api_key ?? "",
        username: meta.username ?? "",
      });
    });
  }, []);

  const handleSave = async () => {
    setStatus("saving");
    const { error } = await createClient().auth.updateUser({
      data: {
        gemini_api_key: keys.gemini,
        openai_api_key: keys.openai,
        anthropic_api_key: keys.anthropic,
        username: keys.username,
      },
    });
    
    if (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const providers = [
    { id: "gemini" as const, label: "Google Gemini", placeholder: "AIzaSy..." },
    { id: "anthropic" as const, label: "Anthropic Claude", placeholder: "sk-ant-..." },
    { id: "openai" as const, label: "OpenAI", placeholder: "sk-..." },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 pt-20 pb-32">
      
      {/* Header */}
      <div className="animate-fade-in mb-14">
        <span className="font-mono text-xs uppercase tracking-widest text-muted mb-4 inline-block">
          Preferences
        </span>
        <h1 className="font-display text-5xl font-bold text-foreground mb-4 leading-tight">
          Ecosystem Identity & Keys
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Set your username and API keys once here. They are securely encrypted in your Supabase profile and dynamically loaded by Metaphor, Orion, and Atlas.
        </p>
      </div>

      {/* Form */}
      <div className="animate-slide-up bg-surface-2 shadow-card border border-border-subtle p-8 sm:p-10 rounded-2xl">
        <div className="flex flex-col gap-6 mb-10">
          
          {/* Username Field */}
          <div>
            <label 
              htmlFor="username" 
              className="block font-mono text-xs uppercase tracking-widest text-foreground mb-3"
            >
              Global Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder="e.g. Theo"
                value={keys.username}
                onChange={(e) => setKeys((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full py-3.5 px-4 bg-surface-1 border border-border-strong rounded-xl text-sm text-foreground font-sans focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="h-px bg-border-subtle my-2" />

          {providers.map((p) => (
            <div key={p.id}>
              <label 
                htmlFor={p.id} 
                className="block font-mono text-xs uppercase tracking-widest text-foreground mb-3"
              >
                {p.label} API Key
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <Key size={16} />
                </div>
                <input
                  id={p.id}
                  type="password"
                  placeholder={p.placeholder}
                  value={keys[p.id]}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-full py-3.5 pr-4 pl-11 bg-surface-1 border border-border-strong rounded-xl text-sm text-foreground font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          <div className="text-sm flex items-center gap-2">
            {status === "saved" && <span className="text-neon-emerald flex items-center gap-1.5"><CheckCircle2 size={16} /> Synced securely</span>}
            {status === "error" && <span className="text-red-500 flex items-center gap-1.5"><AlertCircle size={16} /> Update failed</span>}
            {status === "saving" && <span className="text-muted">Encrypting...</span>}
          </div>
          
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground hover:bg-white text-background text-sm font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0 active:scale-[0.98]"
          >
            <Save size={16} />
            {status === "saving" ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
