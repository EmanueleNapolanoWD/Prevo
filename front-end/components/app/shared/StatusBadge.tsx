"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { getQuoteStatus } from "./quote-status";

type StatusBadgeProps = {
  status: string;
  className?: string;
  dot?: boolean;
};

export function StatusBadge({ status, className, dot = false }: StatusBadgeProps) {
  const config = getQuoteStatus(status as any);
  return (
    <Badge
      variant={config.variant}
      className={cn("border border-current/30", className)}
      style={{ color: config.dotColor }}
    >
      {dot && (
        <span
          className="inline-block size-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: config.dotColor }}
          aria-hidden="true"
        />
      )}
      {config.label}
    </Badge>
  );
}