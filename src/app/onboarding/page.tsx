"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowRight, User, Key, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login");
      else setUser(user);
    });
  }, [router]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    const { error } = await createClient().auth.updateUser({
      data: { username }
    });
    setIsLoading(false);
    if (!error) setStep(2);
  };

  const handleSaveKeys = async () => {
    setIsLoading(true);
    const { error } = await createClient().auth.updateUser({
      data: { gemini_api_key: geminiKey }
    });
    setIsLoading(false);
    if (!error) setStep(3);
  };

  const finishOnboarding = () => {
    router.push("/");
  };

  if (!user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div
        className="animate-slide-up w-full max-w-lg bg-surface-1 border border-border-subtle rounded-3xl p-12 shadow-card"
      >
        {/* Progress steps */}
        <div className="flex gap-2 mb-10 justify-center">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all duration-300 ${step >= i ? "bg-brand-500" : "bg-border-strong"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-6 bg-surface-2 border border-border-strong rounded-2xl flex items-center justify-center text-brand-400">
                <User size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Claim your Pseudonym</h1>
              <p className="text-sm text-muted">Choose the handle you'll use across the ecosystem.</p>
            </div>
            
            <input
              type="text"
              placeholder="e.g. Satoshi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-3.5 px-4 mb-6 bg-surface-2 border border-border-strong rounded-xl text-sm text-foreground focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            
            <button
              onClick={handleSaveProfile}
              disabled={!username || isLoading}
              className="w-full py-3.5 bg-foreground hover:bg-white text-background text-sm font-semibold rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-6 bg-surface-2 border border-border-strong rounded-2xl flex items-center justify-center text-brand-400">
                <Key size={24} />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Sovereign AI Config</h1>
              <p className="text-sm text-muted">Add your Gemini API key to power Clario and Metaphor. Stored securely in your profile metadata.</p>
            </div>
            
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full py-3.5 px-4 mb-6 bg-surface-2 border border-border-strong rounded-xl text-sm text-foreground font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            
            <button
              onClick={handleSaveKeys}
              disabled={isLoading}
              className="w-full py-3.5 bg-foreground hover:bg-white text-background text-sm font-semibold rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {geminiKey ? "Save Keys" : "Skip for now"} <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="w-16 h-16 mx-auto mb-8 bg-neon-emerald/10 border border-neon-emerald/20 rounded-2xl flex items-center justify-center text-neon-emerald">
              <CheckCircle size={32} />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">You're all set!</h1>
            <p className="text-sm text-muted mb-8 leading-relaxed">
              Your sovereign profile is ready. You can now use Atlas, Metaphor, and Orion securely.
            </p>
            
            <button
              onClick={finishOnboarding}
              className="w-full py-3.5 bg-foreground hover:bg-white text-background text-sm font-semibold rounded-xl transition-all active:scale-[0.99]"
            >
              Enter Ecosystem
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
