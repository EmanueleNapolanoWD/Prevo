"use client";

import Link from "next/link";
import { cn } from "cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
};

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {breadcrumb && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumb}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
}