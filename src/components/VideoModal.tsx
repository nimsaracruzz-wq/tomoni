"use client";

import React, { useEffect } from "react";
import { X, Play } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-foreground rounded-3xl shadow-lg overflow-hidden border border-white/10 z-10 animate-fade-in my-8">
          
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-primary transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {/* Visual preview with educational introduction video */}
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
              title="TOMONI Japanese Institute , Campus & Student Life"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Details */}
          <div className="p-6 bg-foreground text-white">
            <h3 className="font-serif-heading text-lg font-bold">
              TOMONI Japanese Institute , Sri Lanka to Japan Pathway
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Explore how TOMONI prepares students for JLPT exams, school Japanese, student visas, and life in Japan.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
