"use client";

import React, { useEffect, useRef, useState } from "react";

export default function MouseComponent() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touchDetected =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (touchDetected) {
      setIsTouch(true);
      return;
    }

    const outer = outerRef.current!;
    if (!outer) return;

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      outer.style.left = `${x}px`;
      outer.style.top = `${y}px`;
    };

    const onPointerOver = (e: PointerEvent) => {
      if (
        (e.target as Element)?.closest(
          "a, button, input, textarea, select, [data-cursor='interactive'], [role='button']"
        )
      ) {
        outer.classList.add("mouse--high-contrast");
      }
    };
    const onPointerOut = (e: PointerEvent) => {
      if (
        (e.target as Element)?.closest(
          "a, button, input, textarea, select, [data-cursor='interactive'], [role='button']"
        )
      ) {
        outer.classList.remove("mouse--high-contrast");
      }
    };

    const onPointerDown = () => outer.classList.add("mouse--pressed");
    const onPointerUp = () => outer.classList.remove("mouse--pressed");

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    outer.style.opacity = "1";

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={outerRef}
        aria-hidden
        className="custom-mouse-outer"
      />

      <style>{`
        :root { --mouse-size: 40px; }
        @media (min-width: 1280px) { :root { --mouse-size: 50px; } }
        @media (min-width: 768px) and (max-width: 1279px) { :root { --mouse-size: 45px; } }
        @media (max-width: 480px) { .custom-mouse-outer { display: none !important; } }

        .custom-mouse-outer {
          position: fixed;
          width: var(--mouse-size);
          height: var(--mouse-size);
          margin-left: calc(var(--mouse-size) / -2);
          margin-top: calc(var(--mouse-size) / -2);
          border-radius: 50%;
          border: 6px solid #007BFF; /* bright blue border */
          background: transparent;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          transform: scale(1);
          transition: transform 0.15s ease-out, opacity 0.15s ease-out, background 0.2s;
        }

        /* Click effect */
        .custom-mouse-outer.mouse--pressed {
          transform: scale(0.8);
        }

        /* High contrast state = filled white circle */
        .custom-mouse-outer.mouse--high-contrast {
          background: #ffffff !important;
          border-color: #000000 !important;
          box-shadow: 0 0 10px rgba(255,255,255,0.9) !important;
        }

        /* hide default cursor on desktop */
        @media (hover: hover) and (pointer: fine) {
          html, body { cursor: none !important; }
        }
      `}</style>
    </>
  );
}
