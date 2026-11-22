import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tomoniedu.com"),
  title: "TOMONI Japanese Language Institute , Learn Japanese in Kuliyapitiya",
  description:
    "TOMONI Japanese Language Institute in Kuliyapitiya offers JLPT N5/N4, O/L, A/L, Kids Japanese, and Student Visa programs.",
  keywords: [
    "TOMONI Japanese Institute",
    "Japanese Language School Sri Lanka",
    "Study in Japan Sri Lanka",
    "Japanese O/L Class Kuliyapitiya",
    "Japanese A/L Class Kuliyapitiya",
    "Japanese Visa Class Sri Lanka",
    "Learn Japanese in Sri Lanka",
  ],
  authors: [{ name: "TOMONI Japanese Institute" }],
  openGraph: {
    title: "TOMONI Japanese Institute , Your Journey to Japan",
    description: "Learn Japanese, prepare documents, get your visa and fly to Japan.",
    url: "https://tomoniedu.com",
    siteName: "TOMONI Japanese Institute",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1200,
        height: 630,
        alt: "TOMONI Japanese Institute",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOMONI Japanese Institute",
    description: "Learn Japanese. Build Your Future in Japan. Based in Sri Lanka.",
    images: ["/assets/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent selection:text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
