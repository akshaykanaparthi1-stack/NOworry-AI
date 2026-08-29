import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoWorry AI — Autonomous Revenue Recovery Agent",
  description: "Detect. Decide. Recover.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
