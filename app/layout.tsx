import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorOS — TikTok Creator Dashboard",
  description: "Manage your collabs, orders, analytics and samples in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
