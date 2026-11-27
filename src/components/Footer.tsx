"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TomoniLogo from "@/components/TomoniLogo";
import { Phone, Mail, Globe, MapPin } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
  { label: "Register", href: "/register" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  {
    name: "YouTube",
    href: "https://youtube.com",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/tomoniedu",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@tomoni.institute",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z",
  },
  {
    name: "Line",
    href: "https://line.me",
    path: "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314",
  },
];

export default function Footer() {
  const [year, setYear] = useState(2026);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      id="contact"
      className="border-t border-border bg-background pt-8 pb-6 lg:py-8"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
    >
      <div className="mx-auto max-w-6xl px-5">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-7 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-6">

          {/* Brand + Mobile Tagline */}
          <div className="flex flex-col items-start gap-3 lg:shrink-0">
            <Link href="/" className="focus:outline-none">
              <TomoniLogo size="sm" />
            </Link>
            <p className="text-[13px] leading-relaxed text-muted-foreground lg:hidden">
              Japanese language education &amp; Japan study pathways from Kuliyapitiya.
            </p>
          </div>

          {/* Navigation Links — clean 2-col grid on mobile, inline row on desktop */}
          <nav
            aria-label="Footer Navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-2 border-y border-border/60 py-5 sm:grid-cols-4 lg:flex lg:flex-wrap lg:items-center lg:gap-5 lg:border-0 lg:py-0"
          >
            {navLinks.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="inline-flex min-h-[40px] items-center text-[13px] font-medium text-foreground/80 hover:text-primary active:text-primary transition-colors lg:min-h-0 lg:text-[11px] lg:text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Social Icons — CENTERED on mobile, left-aligned on desktop */}
          <div className="flex flex-col items-center gap-3 lg:block">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground lg:hidden">
              Follow Us
            </span>
            <div className="flex items-center justify-center gap-3.5 lg:gap-2 lg:justify-start">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background hover:bg-primary active:scale-95 transition-all shadow-sm lg:h-7 lg:w-7"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 fill-current lg:h-3.5 lg:w-3.5"
                    viewBox="0 0 24 24"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info — compact rounded card on mobile, original left-bordered block on desktop */}
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-xs text-foreground/90 space-y-3 lg:rounded-none lg:border-0 lg:border-l lg:border-primary/40 lg:bg-transparent lg:p-0 lg:pl-6 lg:space-y-0.5 lg:text-[11px] lg:text-primary">
            {/* Sri Lanka numbers */}
            <div className="flex items-start gap-2.5 lg:block">
              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:hidden" />
              <div className="min-w-0 leading-relaxed lg:leading-normal">
                <a href="tel:0714919354" className="hover:underline">071 491 9354</a>
                <span> · </span>
                <a href="tel:0702707624" className="hover:underline">070 270 7624</a>
              </div>
            </div>

            {/* Japan / WhatsApp number */}
            <div className="flex items-start gap-2.5 lg:block">
              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:hidden" />
              <div className="min-w-0 leading-relaxed lg:leading-normal">
                <span>Japan: </span>
                <a href="tel:+819038410745" className="hover:underline whitespace-nowrap">
                  +81 90-3841-0745
                </a>{" "}
                <span className="text-muted-foreground lg:text-primary">(</span>
                <a
                  href="https://wa.me/819038410745"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-medium lg:text-primary"
                >
                  WhatsApp
                </a>
                <span className="text-muted-foreground lg:text-primary">)</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2.5 lg:block">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:hidden" />
              <a
                href="mailto:tomoniinstitute@gmail.com"
                className="min-w-0 break-all hover:underline leading-relaxed lg:leading-normal"
              >
                tomoniinstitute@gmail.com
              </a>
            </div>

            {/* Website */}
            <div className="flex items-start gap-2.5 lg:block">
              <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:hidden" />
              <a
                href="https://tomoniedu.com"
                target="_blank"
                rel="noreferrer"
                className="min-w-0 break-words hover:underline leading-relaxed lg:leading-normal"
              >
                tomoniedu.com
              </a>
            </div>

            {/* Address — Google Maps link */}
            <div className="flex items-start gap-2.5 lg:block">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary lg:hidden" />
              <a
                href="https://maps.google.com/?q=No.+355+A+1%2F1+Hettipola+Road%2C+Kuliyapitiya"
                target="_blank"
                rel="noreferrer"
                className="min-w-0 leading-relaxed hover:underline lg:leading-normal"
              >
                No. 355 A 1/1 Hettipola Road, Kuliyapitiya
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Attribution — always centered on mobile, split on desktop */}
        <div className="mt-7 border-t border-border/80 pt-5 flex flex-col items-center gap-1.5 text-center text-xs text-muted-foreground lg:mt-6 lg:pt-4 lg:flex-row lg:justify-between lg:text-left lg:gap-0">
          <p>© {year} Tomoni Japanese Language Institute. All rights reserved.</p>
          <p>
            Made with care by{" "}
            <a
              href="https://paxxmo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Paxxmo ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
