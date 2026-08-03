"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// A thin brand progress bar that shows the moment a navigation starts, so a
// click feels instant even while the destination is still being fetched. It
// starts on any internal link click (and on a manual "toploader:start" event
// for programmatic navigations) and finishes once the route actually changes.
export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(false);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setActive((isOn) => {
      if (isOn) return isOn;
      setWidth(10);
      trickle.current = setInterval(() => {
        setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w));
      }, 200);
      return true;
    });
  }, []);

  const finish = useCallback(() => {
    if (trickle.current) clearInterval(trickle.current);
    setWidth(100);
    const t = setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // The route (or query) changed — the navigation is done.
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      // Same page — nothing will load.
      if (href.split("?")[0] === pathname) return;

      start();
    }

    function onStart() {
      start();
    }

    document.addEventListener("click", onClick);
    window.addEventListener("toploader:start", onStart);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("toploader:start", onStart);
    };
  }, [pathname, start]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full bg-brand shadow-[0_0_10px_rgba(1,84,170,0.6)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// Call before a programmatic navigation (router.push/replace) to show the bar.
export function startTopLoader() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("toploader:start"));
  }
}
