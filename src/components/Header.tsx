"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TomoniLogo from "@/components/TomoniLogo";
import {
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Home,
  BookOpen,
  Users,
  Images,
  Send,
  ClipboardCheck,
} from "lucide-react";

interface HeaderProps {
  onOpenConsultation?: () => void;
  onOpenApply?: () => void;
  onOpenSearch?: () => void;
}

export default function Header({}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Cross-browser scroll lock without shifting body or sticky header ──
   *
   * Locking html/body overflow (instead of position: fixed on body) keeps
   * window.scrollY intact so the sticky header and drawer never jump or
   * change state when opened from lower sections on the page.
   * A non-passive touchmove guard blocks background rubber-band scrolling
   * on iOS Safari while keeping the drawer's nav list scrollable.
   */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (!mobileMenuOpen) {
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      body.style.overflow = "";
      body.style.overscrollBehavior = "";
      return;
    }

    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    const preventBackgroundScroll = (e: TouchEvent) => {
      const nav = navRef.current;
      if (nav && nav.contains(e.target as Node) && nav.scrollHeight > nav.clientHeight) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventBackgroundScroll);
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [mobileMenuOpen]);

  /* ── Close on Escape key ── */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  /* ── Close on route change ── */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const close = useCallback(() => setMobileMenuOpen(false), []);
  const toggle = useCallback(() => setMobileMenuOpen((v) => !v), []);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "About Us", href: "/about", icon: Users },
    { label: "Blog", href: "/blog", icon: BookOpen },
    { label: "Gallery", href: "/gallery", icon: Images },
    { label: "Register", href: "/register", icon: ClipboardCheck },
    { label: "Contact", href: "/contact", icon: Send },
  ];

  return (
    <>
      {/* ════════════════════════════════════
          HEADER BAR
          Elevated to z-50 isolate to guarantee higher stacking context
          than any page hero overlays, modals, or scrolling content.
      ════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 isolate w-full backdrop-blur-md transition-colors duration-300 ${
          isScrolled
            ? "bg-background/95 shadow-sm border-b border-border/80"
            : "bg-background/80"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          <div
            className={`flex items-center justify-between transition-[padding] duration-200 ${
              isScrolled ? "py-2 sm:py-3" : "py-3 sm:py-4"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="focus:outline-none group shrink-0">
              <TomoniLogo size="md" className="transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden gap-7 text-xs font-medium lg:flex items-center" aria-label="Main Navigation">
              {navLinks.map((n) => {
                const isActive = pathname === n.href;
                return (
                  <Link
                    key={n.label}
                    href={n.href}
                    className={`relative py-1 transition-colors ${
                      isActive
                        ? "border-b-2 border-primary pb-1 text-primary font-semibold"
                        : "text-foreground/80 hover:text-primary"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/contact"
                className="items-center gap-3 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-xs font-semibold text-primary-foreground inline-flex hover:opacity-95 transition-colors shadow-sm group"
              >
                <span>Get Consultation</span>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </span>
              </Link>
            </div>

            {/* Hamburger button — visible on mobile only (< lg) */}
            <button
              type="button"
              onClick={toggle}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
              className="relative z-20 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground lg:hidden shadow-sm hover:opacity-90 active:scale-95 transition-all focus:outline-none shrink-0 cursor-pointer touch-manipulation select-none"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════
          MOBILE DRAWER (Portaled to document.body)
          Always renders in the root viewport stacking context with
          consistent positioning and animation regardless of scroll position.
      ════════════════════════════════════ */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              onClick={close}
              style={{
                touchAction: "none",
                visibility: mobileMenuOpen ? "visible" : "hidden",
                transition: mobileMenuOpen
                  ? "opacity 300ms ease-out, visibility 0ms linear 0ms"
                  : "opacity 300ms ease-out, visibility 0ms linear 300ms",
              }}
              className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px] lg:hidden ${
                mobileMenuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Drawer panel — slides cleanly from right */}
            <div
              id="mobile-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal={mobileMenuOpen}
              aria-hidden={!mobileMenuOpen}
              aria-label="Navigation menu"
              style={{
                height: "100dvh",
                maxHeight: "100dvh",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                visibility: mobileMenuOpen ? "visible" : "hidden",
                transition: mobileMenuOpen
                  ? "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0ms linear 0ms"
                  : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0ms linear 300ms",
              }}
              className={`fixed top-0 right-0 z-[90] w-[min(320px,85vw)] bg-background border-l border-border shadow-2xl flex flex-col lg:hidden ${
                mobileMenuOpen
                  ? "translate-x-0 pointer-events-auto"
                  : "translate-x-full pointer-events-none"
              }`}
            >
              {/* ── Top: logo + close (fixed height, never scrolls) ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <TomoniLogo size="sm" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground hover:bg-accent hover:text-primary transition-colors cursor-pointer touch-manipulation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ── Middle: nav links — scrollable ── */}
              <nav
                ref={navRef}
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-1"
                aria-label="Mobile Navigation"
                style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
              >
                {navLinks.map((n) => {
                  const isActive = pathname === n.href;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.label}
                      href={n.href}
                      onClick={close}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted active:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span>{n.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                    </Link>
                  );
                })}

                {/* CTA button */}
                <div className="pt-3 pb-2">
                  <Link
                    href="/contact"
                    onClick={close}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
                  >
                    Get Consultation
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </nav>

              {/* ── Bottom: contact strip (fixed, never scrolls) ── */}
              <div className="shrink-0 border-t border-border px-5 py-4 space-y-2 bg-muted/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Contact
                </p>
                <div className="flex items-center gap-2 text-xs text-foreground/80">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>071 491 9354 · 070 270 7624</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/80">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>+81 90-3841-0745 (Japan / WA)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/80">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">tomoniinstitute@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Kuliyapitiya, Sri Lanka</span>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
