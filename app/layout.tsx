import type { Metadata } from "next";
import { Fredoka, Outfit } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const outfit = Outfit({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Essma World | Rancho de Essma",
  description: "Un mundo de aventuras, amigos y estilos para crear.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body
        className={`${fredoka.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
