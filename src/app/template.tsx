"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Reset and re-trigger on route change
    if (prevPathname.current !== pathname) {
      setIsVisible(false);
      // Scroll to top smoothly on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevPathname.current = pathname;

    // Small delay so the browser paints the initial state, then animate in
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }`}
    >
      {children}
    </div>
  );
}
