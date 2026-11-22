"use client";

import React, { useState, useEffect } from "react";
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
        className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
          isScrolled
            ? "bg-background/95 shadow-sm border-b border-border/80"
            : "bg-background/80"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between py-4">
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

            {/* Desktop Right CTA */}
            <div className="hidden sm:flex items-center gap-3">
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
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground lg:hidden shadow-sm hover:opacity-90 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Upgraded Mobile Drawer / Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="menu-backdrop-enter fixed inset-0 bg-foreground/60 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="menu-panel-enter fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border p-6 shadow-lg flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <TomoniLogo size="sm" />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground hover:bg-accent hover:text-primary transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="py-6 space-y-1.5" aria-label="Mobile Navigation">
                {navLinks.map((n) => {
                  const isActive = pathname === n.href;
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.label}
                      href={n.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-primary font-bold shadow-xs"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{n.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </Link>
                  );
                })}
              </nav>

              {/* Call to Action Button */}
              <div className="pt-2">
                {handleAction ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAction();
                    }}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-colors"
                  >
                    <span>Get Consultation</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-95 transition-colors"
                  >
                    <span>Get Consultation</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Contact Details in Mobile Menu */}
            <div className="pt-6 border-t border-border mt-8 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>No. 355 A 1/1 Hettipola Road, Kuliyapitiya</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>tomoniinstitute@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>071 491 9354 · 070 270 7624</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
