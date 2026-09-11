import type { Metadata } from "next";
import { Anton, Archivo, Space_Mono } from "next/font/google";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BIG BONG THEORY | Turning Misfits Into Main Characters",
  description:
    "Big Bong Theory is a creative community, not a company — events, adda nights, film screenings, and noise floors for creators, artists, filmmakers, and musicians. Kolkata / Everywhere.",
  openGraph: {
    title: "BIG BONG THEORY | Turning Misfits Into Main Characters",
    description:
      "A creative community, not a company. Explore upcoming BBT events and join the chaos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${spaceMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background font-body antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
