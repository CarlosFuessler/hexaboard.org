import type { Metadata } from "next";
import "./globals.css";
import MatrixBackground from "./components/MatrixBackground";

export const metadata: Metadata = {
  title: "Hexaboard - The 2x3 Mechanical Keyboard",
  description: "Experience the future of typing with Hexaboard. Hot-swappable, fully programmable, and beautifully designed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MatrixBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
