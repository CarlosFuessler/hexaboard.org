import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexaboard - The Ultimate Custom Keyboard",
  description: "Experience the future of typing with Hexaboard. Hot-swappable, fully programmable, and beautifully designed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
