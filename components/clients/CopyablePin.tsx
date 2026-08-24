"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyablePin({
  pin,
  className,
}: {
  pin: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success("PIN nusxalandi");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Badge
      variant="outline"
      onClick={handleCopy}
      className={cn(
        "shrink-0 cursor-pointer select-none font-mono transition-colors hover:bg-secondary",
        className,
      )}>
      {pin}
      {copied ? (
        <Check className="ml-1.5 h-3 w-3 text-success" />
      ) : (
        <Copy className="ml-1.5 h-3 w-3 text-muted-foreground" />
      )}
    </Badge>
  );
}
