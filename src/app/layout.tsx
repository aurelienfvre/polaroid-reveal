import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/global.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolageGrotesque = localFont({
  src: "../fonts/BricolageGrotesque-VariableFont_opsz,wdth,wght.woff2",
  variable: "--font-bricolage",
  display: "swap",
});

const commitMono = localFont({
  src: [
    { path: "../fonts/CommitMono-400-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CommitMono-400-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/CommitMono-700-Regular.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CommitMono-700-Italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-commit",
  display: "swap",
});

const indieFlower = localFont({
  src: "../fonts/IndieFlower-Regular.woff2",
  variable: "--font-indie",
  display: "swap",
});

const shadowsIntoLight = localFont({
  src: "../fonts/ShadowsIntoLight-Regular.woff2",
  variable: "--font-shadows",
  display: "swap",
});

const fontVariables = [
  geistSans.variable,
  bricolageGrotesque.variable,
  commitMono.variable,
  indieFlower.variable,
  shadowsIntoLight.variable,
].join(" ");

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
    <html lang="fr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
