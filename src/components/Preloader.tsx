"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Editorial 2026 preloader matched to Tomoni's warm paper & crimson aesthetic.
 * Runs once on initial full-page load (never on client-side route transitions)
 * and unmounts cleanly after its exit transition.
 */
export default function Preloader() {
  const [phase, setPhase] = useState<"visible" | "exiting" | "done">("visible");

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setPhase("done");
      return;
    }

    let minElapsed = false;
    let pageLoaded = document.readyState === "complete";
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;

    const tryExit = () => {
      if (!minElapsed || !pageLoaded) return;
      setPhase("exiting");
      unmountTimer = setTimeout(() => setPhase("done"), 450);
    };

    const onLoad = () => {
      pageLoaded = true;
      tryExit();
    };

    if (!pageLoaded) {
      window.addEventListener("load", onLoad, { once: true });
    }

    // Ensure the entrance stroke plays smoothly without holding slow connections
    exitTimer = setTimeout(() => {
      minElapsed = true;
      tryExit();
    }, 650);

    // Hard cap so slow third-party assets never stall the preloader
    const fallbackTimer = setTimeout(() => {
      pageLoaded = true;
      minElapsed = true;
      tryExit();
    }, 1500);

    return () => {
      window.removeEventListener("load", onLoad);
      if (exitTimer) clearTimeout(exitTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (phase === "done") return null;

  const isExiting = phase === "exiting";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background px-6 select-none ${
        isExiting
          ? "pointer-events-none opacity-0 scale-[1.015]"
          : "pointer-events-auto opacity-100 scale-100"
      }`}
      style={{
        height: "100dvh",
        transition:
          "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Subtle warm radial accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--signal)_7%,transparent)_0%,transparent_58%)]" />

      <div className="relative flex flex-col items-center">
        {/* Enso / rising-sun ring framing the institute emblem */}
        <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--rule)"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeDasharray="283"
              className="preloader-ring-draw"
            />
          </svg>

          <div className="preloader-emblem-in relative h-16 w-20 sm:h-20 sm:w-24">
            <Image
              src="/images/tomoni_japanese_institute_logo.png"
              alt=""
              fill
              priority
              sizes="96px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Minimal Japanese & English subtitle */}
        <div className="preloader-text-in mt-5 flex flex-col items-center text-center">
          <p className="font-serif text-base tracking-tight text-foreground sm:text-lg">
            共に <span className="mx-1.5 text-primary/50">·</span> Tomoni
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Learn together · Grow together
          </p>
        </div>

        {/* Hairline crimson progress sweep */}
        <div className="mt-5 h-[2px] w-36 overflow-hidden rounded-full bg-border/80">
          <div className="preloader-bar-fill h-full w-full origin-left rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
