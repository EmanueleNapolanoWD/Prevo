import {
  BarChart3,
  Bot,
  Check,
  FileText,
  Folder,
  Package,
  ShieldCheck,
  Share2,
  Users,
  Zap,
} from "lucide-react";
import type { SVGProps } from "react";

const ICONS: Record<string, React.ComponentType<SVGProps<SVGSVGElement>>> = {
  BarChart3,
  Bot,
  Check,
  FileText,
  Folder,
  Package,
  ShieldCheck,
  Share2,
  Users,
  Zap,
};

export function Icon({
  name,
  className,
  ...props
}: { name: string; className?: string }) {
  const Comp = ICONS[name];
  if (!Comp) return null;
  return <Comp className={className} {...props} />;
}
