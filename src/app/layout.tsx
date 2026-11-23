import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL, SITE_NAME, DEFAULT_SEO_KEYWORDS } from "@/lib/seo";
import {
  JsonLd,
  getEducationalOrganizationSchema,
  getWebSiteSchema,
} from "@/lib/schema";

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

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Japanese Language Classes in Sri Lanka | Tomoni Japanese Language Center",
    template: "%s | Tomoni Japanese Language Center",
  },
  description:
    "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. Explore Japanese language courses, JLPT preparation (N5, N4, N3), JFT-Basic, and opportunities to study and work in Japan.",
  keywords: DEFAULT_SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  generator: "Next.js",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-LK": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: "Japanese Language Classes in Sri Lanka | Tomoni Japanese Language Center",
    description:
      "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. Explore Japanese language courses, JLPT preparation, and opportunities to study and work in Japan.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_LK",
    type: "website",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Tomoni Japanese Language Center in Sri Lanka - Japanese Classes and Visa Pathways",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Japanese Language Classes in Sri Lanka | Tomoni Japanese Language Center",
    description:
      "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. JLPT N5/N4, JFT-Basic, and Study in Japan pathways.",
    images: ["/assets/hero.jpg"],
    creator: "@tomoni_institute",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <head>
        <JsonLd data={getEducationalOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-accent selection:text-primary font-sans">
        {children}

        {/* Google Analytics 4 (if configured) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
