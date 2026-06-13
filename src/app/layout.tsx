import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant Access Control",
  description: "Visitor registration and access tracking for industrial facilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
