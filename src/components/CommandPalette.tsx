"use client";

import React, { useEffect, useState } from "react";
import { Search, Monitor, Smartphone, Key, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getEcosystemIcon } from "./EcosystemIcons";

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { id: "atlas", icon: getEcosystemIcon("Atlas", 16, "#C4841F"), label: "Open Atlas io", category: "Ecosystem", action: () => window.open("https://atlas-scale.vercel.app", "_blank") },
    { id: "metaphor", icon: getEcosystemIcon("Metaphor", 16, "#4E6CF2"), label: "Open Metaphor", category: "Ecosystem", action: () => window.open("https://metaphor-three.vercel.app", "_blank") },
    { id: "orion", icon: getEcosystemIcon("Orion", 16, "#863bff"), label: "Push session to Orion", category: "Handoff", action: () => { router.push("/devices"); onClose(); } },
    { id: "keys", icon: <Key size={16} />, label: "Manage API Keys", category: "Settings", action: () => { router.push("/settings"); onClose(); } },
    { id: "lock", icon: <ShieldCheck size={16} />, label: "Lock global session", category: "Security", action: () => { /* Add signout */ onClose(); } },
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % commands.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + commands.length) % commands.length);
    }
    if (e.key === "Enter" && commands[selectedIndex]) {
      e.preventDefault();
      commands[selectedIndex].action();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[100] bg-background/60 backdrop-blur-xl flex items-start justify-center pt-[12vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-up w-full max-w-lg bg-surface-1 border border-border-strong rounded-2xl shadow-card-hover overflow-hidden">
        <div className="flex items-center px-5 py-4 border-b border-border-subtle">
          <Search size={18} className="text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent border-none outline-none text-base text-foreground px-4 font-sans"
          />
          <div className="flex gap-1">
            <span className="text-[10px] px-1.5 py-1 bg-surface-2 border border-border-subtle rounded text-muted">ESC</span>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {commands.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              No commands found.
            </div>
          ) : (
            commands.map((cmd, i) => {
              const isSelected = i === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-surface-2 border-border-subtle"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-muted">
                    {cmd.icon}
                  </div>
                  <div className="flex-1">
                    <span className={`block text-sm font-medium ${isSelected ? "text-brand-400" : "text-foreground"}`}>
                      {cmd.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5 block">
                      {cmd.category}
                    </span>
                  </div>
                  {isSelected && <ArrowRight size={14} className="text-brand-400" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
