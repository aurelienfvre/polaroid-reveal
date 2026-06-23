import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist } from "next/font/google";
import "@/styles/global.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polaroid Reveal",
  description:
    "Experience web immersive pour revivre des souvenirs numerises Polaroid.",
  applicationName: "Polaroid Reveal",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Polaroid Reveal",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
