"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getEcosystemIcon } from "./EcosystemIcons";
import { ECOSYSTEM_APPS } from "@/lib/ecosystem";
import { CommandPalette } from "./CommandPalette";

// Custom Hook to check if an app's local dev server is running
function useLivePing(url: string, interval = 5000) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkLive = async () => {
      try {
        const res = await fetch(url + "/favicon.svg", { mode: "no-cors", cache: "no-store" });
        if (mounted) setIsLive(true); // If it doesn't throw, it's reachable
      } catch (e) {
        if (mounted) setIsLive(false);
      }
    };
    checkLive();
    const id = setInterval(checkLive, interval);
    return () => { mounted = false; clearInterval(id); };
  }, [url, interval]);

  return isLive;
}

// Waffle Item Component to handle its own ping
function WaffleItem({ app, onClose }: { app: typeof ECOSYSTEM_APPS[0], onClose: () => void }) {
  const isLive = useLivePing(app.defaultUrl);

  return (
    <a
      href={app.defaultUrl}
      target="_blank"
      rel="noreferrer"
      onClick={onClose}
      className="flex flex-col items-center gap-2 p-3 rounded-xl text-no-underline bg-transparent border border-transparent hover:bg-surface-2 hover:border-border-subtle transition-all relative"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-2 border border-border-subtle shadow-card overflow-hidden"
        style={{ color: app.accentColor }}
      >
        {getEcosystemIcon(app.iconName, 20, app.accentColor)}
      </div>
      <span className="text-[11px] text-foreground font-medium text-center leading-tight">
        {app.name}
      </span>
      
      {/* Live Status Indicator */}
      <div className="absolute top-2.5 right-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-neon-emerald shadow-glow-em" : "bg-border-strong"}`} />
      </div>
    </a>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const waffleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (waffleRef.current && !waffleRef.current.contains(e.target as Node)) setIsWaffleOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
  };

  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Devices", href: "/devices" },
    { label: "Settings", href: "/settings" },
  ];

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "–";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-2xl border-b border-border-subtle animate-fade-in">
        <div className="w-full px-8 h-14 flex items-center justify-between gap-4">

          {/* Left: Logo + nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
              <div className="w-5 h-5 rounded-md bg-surface-2 border border-border-strong flex items-center justify-center shadow-card text-foreground">
                {getEcosystemIcon("Pseudonyms", 12, "currentColor")}
              </div>
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-foreground">
                Pseudonyms
              </span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-[13px] transition-all no-underline ${
                      isActive
                        ? "font-semibold text-foreground bg-surface-2 border border-border-subtle shadow-card"
                        : "font-medium text-muted hover:text-foreground hover:bg-surface-2 border border-transparent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Waffle + Profile */}
          <div className="flex items-center gap-3">

            {/* 9-dot Waffle */}
            <div ref={waffleRef} className="relative">
              <button
                onClick={() => { setIsWaffleOpen(!isWaffleOpen); setIsProfileOpen(false); }}
                className={`w-9 h-9 bg-transparent border rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                  isWaffleOpen
                    ? "bg-surface-2 border-border-subtle text-foreground"
                    : "border-transparent text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <div className="grid grid-cols-3 gap-[2.5px] w-[13px] h-[13px]">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span key={i} className="w-[2.5px] h-[2.5px] rounded-full bg-current" />
                  ))}
                </div>
              </button>

              {isWaffleOpen && (
                <div className="animate-slide-up absolute right-0 top-[calc(100%+8px)] w-72 bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-card-hover z-50">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted pb-3 border-b border-border-subtle mb-3">
                    Ecosystem Connect
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {ECOSYSTEM_APPS.map((app) => (
                      <WaffleItem key={app.id} app={app} onClose={() => setIsWaffleOpen(false)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsWaffleOpen(false); }}
                className={`flex items-center gap-2.5 py-1 pl-3 pr-1.5 rounded-full cursor-pointer transition-all border ${
                  isProfileOpen
                    ? "bg-surface-2 border-border-subtle shadow-card"
                    : "bg-transparent border-transparent hover:bg-surface-2"
                }`}
              >
                <span className="text-[13px] font-medium text-foreground">
                  {user?.email?.split("@")[0] ?? ""}
                </span>
                <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-[10px] font-semibold text-background font-mono tracking-wide">
                  {initials}
                </div>
              </button>

              {isProfileOpen && (
                <div className="animate-slide-up absolute right-0 top-[calc(100%+12px)] w-64 bg-surface-1 border border-border-subtle rounded-2xl p-5 shadow-card-hover z-50">
                  <div className="mb-4 pb-4 border-b border-border-subtle">
                    <p className="text-[15px] font-semibold text-foreground mb-1">
                      {user?.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 px-3 bg-transparent border border-border-subtle rounded-lg text-[13px] font-medium text-muted flex items-center gap-2 cursor-pointer transition-all hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/5"
                  >
                    <LogOut size={14} />
                    Sign out globally
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
