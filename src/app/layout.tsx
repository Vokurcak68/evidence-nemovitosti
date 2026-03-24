import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evidence nemovitostí",
  description: "Mobilní evidence pozemků, úkolů a uživatelů",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
