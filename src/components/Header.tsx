"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

/** Save/restore scroll position across iOS body-lock/unlock cycles */
let _savedScrollY = 0;

export default function Header({
  onOpenConsultation,
  onOpenApply,
}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

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

  /* ── iOS-safe body scroll lock ──
   *
   * Strategy: position:fixed + top:-scrollY is the only cross-browser
   * approach that works on both iOS Safari and Chrome for Android.
   * We also lock <html> overflow to prevent double-scroll on some devices.
   */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (mobileMenuOpen) {
      wasOpenRef.current = true;
      _savedScrollY = window.scrollY;
      // Lock
      html.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${_savedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflowY = "scroll"; // keep scrollbar width to avoid layout shift
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      // Unlock and restore only if it was previously opened
      html.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflowY = "";
      window.scrollTo({ top: _savedScrollY, behavior: "instant" as ScrollBehavior });
    }

    return () => {
      // Safety cleanup if component unmounts while open
      html.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflowY = "";
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

  const handleAction = onOpenConsultation || onOpenApply;

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
              {handleAction ? (
                <button
                  type="button"
                  onClick={handleAction}
                  className="items-center gap-3 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-xs font-semibold text-primary-foreground inline-flex hover:opacity-95 transition-colors shadow-sm group"
                >
                  <span>Get Consultation</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </span>
                </button>
              ) : (
                <Link
                  href="/register"
                  className="items-center gap-3 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-xs font-semibold text-primary-foreground inline-flex hover:opacity-95 transition-colors shadow-sm group"
                >
                  <span>Get Consultation</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </span>
                </Link>
              )}
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
          MOBILE DRAWER (portal-like, fixed)
          Uses 100dvh for correct mobile-browser height
      ════════════════════════════════════ */}

      {/* Backdrop — covers full screen, blocks touches ONLY when open */}
      <div
        aria-hidden="true"
        onClick={close}
        style={mobileMenuOpen ? { touchAction: "none" } : undefined}
        className={`fixed inset-0 z-[60] bg-black/60 transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      />

      {/* Drawer panel — slides in from right
       *  h-[100dvh] = dynamic viewport height
       *  Completely pointer-events-none and invisible when closed so it
       *  can never intercept clicks or touches aimed at the header or hamburger button.
       */}
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
        }}
        className={`fixed top-0 right-0 z-[70] w-[min(320px,85vw)] bg-background border-l border-border shadow-2xl flex flex-col lg:hidden transition-all duration-300 ease-out will-change-transform ${
          mobileMenuOpen
            ? "translate-x-0 opacity-100 pointer-events-auto visible"
            : "translate-x-full opacity-0 pointer-events-none invisible"
        }`}
        onTouchMove={(e) => {
          if (!mobileMenuOpen) return;
          const target = e.currentTarget;
          const nav = target.querySelector("nav");
          if (nav && nav.contains(e.target as Node)) return; // let the nav scroll
          e.stopPropagation();
        }}
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
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-1"
          aria-label="Mobile Navigation"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {navLinks.map((n, i) => {
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
                style={{
                  transitionDelay: mobileMenuOpen ? `${i * 20}ms` : "0ms",
                }}
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
            {handleAction ? (
              <button
                type="button"
                onClick={() => {
                  close();
                  handleAction();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
              >
                Get Consultation
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/register"
                onClick={close}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
              >
                Get Consultation
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
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
    </>
  );
}
