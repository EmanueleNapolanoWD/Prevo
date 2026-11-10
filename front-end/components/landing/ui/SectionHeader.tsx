import { cn } from "cn";
import { Kicker } from "./Kicker";

export interface SectionHeaderProps {
  kicker: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ kicker, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("text-center max-w-3xl mx-auto", className)}>
      <Kicker>{kicker}</Kicker>
      <h2 className="text-[36px] font-bold tracking-tight text-prevo-ink sm:text-[40px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-prevo-text leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
