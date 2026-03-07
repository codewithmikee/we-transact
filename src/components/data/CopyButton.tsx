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
        "inline-flex items-center justify-center p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
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
      {label && <span className="text-muted-foreground text-xs">{label}</span>}
      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground max-w-[200px] truncate">
        {value}
      </code>
      <CopyButton value={value} />
    </div>
  );
}
