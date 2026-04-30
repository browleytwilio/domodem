"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "domdemo:scroll";

type ScrollMap = Record<string, number>;

function readMap(): ScrollMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScrollMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: ScrollMap) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function useScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    const saved = readMap()[key];
    if (typeof saved === "number") {
      window.scrollTo(0, saved);
    } else {
      window.scrollTo(0, 0);
    }
    prevKey.current = key;
  }, [key]);

  useEffect(() => {
    function handleSnapshot() {
      if (!prevKey.current) return;
      const map = readMap();
      map[prevKey.current] = window.scrollY;
      writeMap(map);
    }
    window.addEventListener("pagehide", handleSnapshot);
    window.addEventListener("beforeunload", handleSnapshot);
    return () => {
      window.removeEventListener("pagehide", handleSnapshot);
      window.removeEventListener("beforeunload", handleSnapshot);
      handleSnapshot();
    };
  }, [key]);
}
