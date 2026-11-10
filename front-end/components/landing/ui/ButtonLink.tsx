import { cn } from "cn";

export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "ghost" | "onDark";
  size?: "sm" | "md";
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  primary: "bg-prevo-primary text-white hover:bg-[var(--prevo-primary-hover)] hover:shadow-sm active:scale-95",
  secondary:
    "border border-prevo-border text-prevo-ink bg-white hover:bg-prevo-bg active:scale-95",
  ghost: "text-prevo-text hover:text-prevo-primary hover:bg-prevo-bg active:scale-95",
  onDark: "bg-white text-prevo-dark hover:bg-prevo-primary-hover active:scale-95",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  href,
  className,
  ...props
}: ButtonLinkProps) {
  const Comp: React.ElementType = href ? "a" : "button";
  return (
    <Comp
      className={cn(base, variants[variant], sizes[size], className)}
      {...(href ? { href } : { type: "button" })}
      {...props}
    />
  );
}
