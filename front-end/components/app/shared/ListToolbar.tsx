"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type ListToolbarProps = {
  placeholder?: string;
  q?: string;
  onQueryChange?: (value: string) => void;
  filterLabel?: string;
  filterValue?: string;
  filterOptions?: { value: string; label: string }[];
  onFilterChange?: (value: string) => void;
  action?: React.ReactNode;
  className?: string;
};

export function ListToolbar({
  placeholder = "Cerca…",
  q,
  onQueryChange,
  filterLabel,
  filterValue,
  filterOptions,
  onFilterChange,
  action,
  className,
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border pb-4",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder={placeholder}
            value={q ?? ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        {filterLabel && filterOptions && (
          <Select
            defaultValue={filterValue ?? "all"}
            onValueChange={(value) => { if (typeof value === "string") onFilterChange?.(value) }}
          >
            <SelectTrigger className="min-w-[140px] text-sm">
              <SelectValue placeholder={filterLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filterLabel}</SelectItem>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">{action}</div>
      )}
    </div>
  );
}