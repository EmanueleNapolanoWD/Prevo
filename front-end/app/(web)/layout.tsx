import Navbar from "@/components/app/Navbar/Navbar";
import { LayoutProps } from "next/dist/lib/metadata/metadata-resolution-primitives";

export default function WebLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
    </>
  );
}
