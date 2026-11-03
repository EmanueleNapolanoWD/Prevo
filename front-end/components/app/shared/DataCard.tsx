"use client";

import { cn } from "cn";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type DataCardProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function DataCard({
  title,
  description,
  action,
  children,
  footer,
  className,
}: DataCardProps) {
  return (
    <Card className={cn("border border-border/50 bg-card shadow-sm", className)}>
      {(title || description || action) && (
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3">
          <div className="flex flex-col gap-0.5">
            {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}