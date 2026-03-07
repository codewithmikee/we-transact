"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className={cn(
        "inline-flex items-center justify-center p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/** Inline mono value + copy button */
export function CopyField({
  label,
  value,
}: {
  label?: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-slate-500 text-xs">{label}</span>}
      <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 max-w-[200px] truncate">
        {value}
      </code>
      <CopyButton value={value} />
    </div>
  );
}
