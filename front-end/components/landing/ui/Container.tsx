import { cn } from "cn";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Padding laterali (default: px-4 su mobile, px-6 sm, px-8 lg) */
  padding?: "none" | "sm" | "lg";
}

export function Container({ children, className, padding = "lg" }: ContainerProps) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "px-4 sm:px-6 lg:px-8"
        : "px-4 sm:px-6 lg:px-8";

  return (
    <div className={cn("max-w-[1120px] mx-auto", pad, className)}>
      {children}
    </div>
  );
}
