import React from "react";
import Image from "next/image";

interface TomoniLogoProps {
  className?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export default function TomoniLogo({
  className = "",
  variant = "dark",
  size = "md",
}: TomoniLogoProps) {
  return (
    <div className={`relative ${size === "sm" ? "h-12 w-40" : size === "lg" ? "h-20 w-64" : "h-16 w-52"} ${className}`}>
      <Image
        src="/images/tomoni_japanese_institute_logo.png"
        alt="TOMONI Japanese Language Institute"
        fill
        sizes="(max-width: 640px) 208px, 256px"
        className="object-contain object-left"
        priority={size !== "sm"}
      />
    </div>
  );
}
