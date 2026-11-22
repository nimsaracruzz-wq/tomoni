"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ReadyCtaBannerProps {
  onContactClick?: () => void;
}

export default function ReadyCtaBanner({ onContactClick }: ReadyCtaBannerProps) {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-signal-deep bg-primary text-white shadow-lg lg:rounded-full">
          <div className="relative grid min-h-[124px] grid-cols-1 items-center lg:min-h-[108px] lg:grid-cols-12">

            {/* Center: Headline & Subtitle */}
            <div className="px-6 pt-7 text-center lg:col-span-8 lg:col-start-3 lg:px-8 lg:py-4 lg:text-left">
              <h3 className="font-serif-heading text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                Ready to Start Your Journey?
              </h3>
              <p className="mt-1 text-xs leading-snug text-white/85 sm:text-[13px]">
                Get in touch with us today. Our team is here to help you.
              </p>
            </div>

            <div className="flex justify-center px-6 pb-7 pt-4 lg:col-span-2 lg:px-0 lg:pb-0 lg:pr-8 lg:pt-0 lg:justify-end">
              <Link
                href="/register"
                onClick={onContactClick}
                className="group inline-flex items-center gap-2 rounded-full border border-white/50 bg-white px-7 py-3 text-xs font-bold text-signal-deep shadow-sm transition-colors duration-200 hover:bg-paper-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-sm"
              >
                <span>Contact Us</span>
                <ChevronRight className="h-4 w-4 text-signal-deep transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

