"use client";

import { useEffect, useRef } from "react";

interface Props {
  code: string;
  className?: string;
  minHeight?: number;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ code, className, minHeight = 250 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !code) return;

    const insTags = ref.current.querySelectorAll("ins.adsbygoogle");
    insTags.forEach(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // adsbygoogle not yet loaded or ad blocked — fail silently
      }
    });
  }, [code]);

  if (!code || !code.trim()) return null;

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight }}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
