import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexaboard",
  description: "Hexaboard - Your 2x3 Keyboard for Ultimate Productivity. Powered by ZMK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
