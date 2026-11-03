import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preventivo",
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        html, body { margin: 0; background: #fff !important; color: #000; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      `}</style>

      <div className="bg-white text-black">{children}</div>
    </>
  );
}
