"use client";

import { cn } from "cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-12 text-center text-muted-foreground",
        className
      )}
    >
      {icon && <div className="flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}