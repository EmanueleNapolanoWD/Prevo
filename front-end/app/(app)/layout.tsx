import { LayoutProps } from "next/dist/lib/metadata/metadata-resolution-primitives";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (<body className="min-h-full flex flex-col">{children}</body>)
}
