"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export default function Header({
  onOpenConsultation,
  onOpenApply,
}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleAction = onOpenConsultation || onOpenApply;

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "About Us", href: "/about", icon: Users },
    { label: "Gallery", href: "/gallery", icon: Images },
    { label: "Register", href: "/register", icon: ClipboardCheck },
    { label: "Contact", href: "/contact", icon: Send },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 shadow-sm border-b border-border/80"
            : "bg-background/80"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5">
          <div
            className={`flex items-center justify-between transition-all duration-200 ${
              isScrolled ? "py-2.5 sm:py-3" : "py-3 sm:py-4"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="focus:outline-none group">
              <TomoniLogo size="md" className="transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* Desktop Navigation */}
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

            {/* Desktop Right CTA — only visible at lg+ alongside desktop nav */}
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

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground lg:hidden shadow-sm hover:opacity-90 transition-all focus:outline-none"
            >
              <span className="relative h-5 w-5">
                <Menu className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
                <X className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay — always in DOM, animated via CSS */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-foreground/60 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm h-[100dvh] max-h-[100dvh] bg-background border-l border-border p-5 sm:p-6 shadow-2xl flex flex-col justify-between z-10 overflow-y-auto overscroll-contain transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="space-y-4">
            {/* Header inside drawer */}
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <TomoniLogo size="sm" />
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground hover:bg-accent hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1" aria-label="Mobile Navigation">
              {navLinks.map((n, i) => {
                const isActive = pathname === n.href;
                const Icon = n.icon;
                return (
                  <Link
                    key={n.label}
                    href={n.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-primary font-bold shadow-xs"
                        : "text-foreground hover:bg-muted"
                    }`}
                    style={{ transitionDelay: mobileMenuOpen ? `${30 + i * 20}ms` : "0ms" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span>{n.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                  </Link>
                );
              })}
            </nav>

            {/* Call to Action Button */}
            <div className="pt-1">
              {handleAction ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAction();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-colors"
                >
                  <span>Get Consultation</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-colors"
                >
                  <span>Get Consultation</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Contact Details in Mobile Menu */}
          <div className="pt-3 border-t border-border mt-3 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>071 491 9354 · 070 270 7624</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Japan: +81 90-3841-0745 (Call / WA)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">tomoniinstitute@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">Kuliyapitiya, Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
