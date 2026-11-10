import { cn } from "cn";

export interface KickerProps {
  children: React.ReactNode;
  className?: string;
}

export function Kicker({ children, className }: KickerProps) {
  return (
    <p
      className={cn(
        "inline-block mb-3 text-[11px] font-bold tracking-[0.22em] uppercase text-prevo",
        className
      )}
    >
      {children}
    </p>
  );
}
