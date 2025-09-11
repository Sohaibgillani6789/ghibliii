"use client";

import { useEffect, useRef, memo } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import dynamic from "next/dynamic";
import '../styles/globals.css';
import LazyGhibliSection from "./shaders/LazyGhibliSection";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

// Separate style object for better readability
const sectionStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  color: "white",
  position: "relative" as const,
  overflow: "hidden",
};


// Dynamic import for the GhibliScene
const GhibliScene = dynamic(() => import("./shaders/scene").then((mod) => mod.default), { ssr: false });

const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false); 
  const currentIndexRef = useRef(-1);
  const sectionScrollsRef = useRef(0);
  const gotoSectionRef = useRef<((index: number, direction: number) => void) | null>(null);
  function handleNavClick(idx: number) {
    if (isAnimatingRef.current || currentIndexRef.current === idx) return;
    const direction = idx > currentIndexRef.current ? 1 : -1;
    gotoSectionRef.current?.(idx, direction);
  }

  useEffect(() => {
    if (!containerRef.current) return;

    // Hide container until GSAP setup is done
    containerRef.current.style.visibility = "hidden";

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("section");
      const images = gsap.utils.toArray<HTMLDivElement>(".bg");
      const imageClips = gsap.utils.toArray<HTMLDivElement>(".image-clip");

      gsap.set(sections, { autoAlpha: 0 });

      const gotoSection = (index: number, direction: number) => {
        const sectionsLength = sections.length;
        index = (index + sectionsLength) % sectionsLength;
        if (isAnimatingRef.current || index === currentIndexRef.current) return;

        isAnimatingRef.current = true;
        const dFactor = direction === -1 ? -1 : 1;
        const currentSection = sections[currentIndexRef.current];
        const nextSection = sections[index];

        const tl = gsap.timeline({
          defaults: { duration: 1.25, ease: "power1.inOut" },
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        if (currentIndexRef.current >= 0) {
          gsap.set(currentSection, { zIndex: 0, autoAlpha: 0 });
          tl.to(images[currentIndexRef.current], { yPercent: -15 * dFactor }, 0);
        }

        gsap.set(nextSection, { autoAlpha: 1, zIndex: 1 });
        tl.fromTo(
          nextSection,
          {
            clipPath: "polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)",
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          },
          0
        ).fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0);

        currentIndexRef.current = index;
      };

      gotoSectionRef.current = gotoSection;
      gotoSection(0, 1);

      // Reveal container after initial GSAP setup
      if (containerRef.current) containerRef.current.style.visibility = "visible";

      const observer = Observer.create({
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        onUp: () => {
          if (isAnimatingRef.current) return;
          if (currentIndexRef.current === 0) {
            if (sectionScrollsRef.current === 0) {
              isAnimatingRef.current = true;
              gsap.to(imageClips[0], {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.5,
                ease: "power3.out",
                onComplete: () => {
                  isAnimatingRef.current = false;
                },
              });
              sectionScrollsRef.current = 1;
            } else {
              sectionScrollsRef.current = 0;
              gotoSection(currentIndexRef.current + 1, 1);
            }
          } else if (currentIndexRef.current < sections.length - 1) {
            gotoSection(currentIndexRef.current + 1, 1);
          }
        },
        onDown: () => {
          if (isAnimatingRef.current) return;
          if (currentIndexRef.current === 0) {
            if (sectionScrollsRef.current === 1) {
              isAnimatingRef.current = true;
              gsap.to(imageClips[0], {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 30%, 40% 0%)",
                duration: 1.5,
                ease: "power3.out",
                onComplete: () => {
                  isAnimatingRef.current = false;
                },
              });
              sectionScrollsRef.current = 0;
            }
          } else if (currentIndexRef.current > 0) {
            gotoSection(currentIndexRef.current - 1, -1);
          }
        },
        tolerance: 10,
        preventDefault: true,
      });

      return () => observer.kill();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ visibility: "hidden" }}>
  {/* Navigation buttons removed as requested */}

    {/* Section 1 */}
<section
  style={{
    ...sectionStyle,
    position: "fixed",
    width: "100%",
    height: "100vh",
    top: 0,
    left: 0,
    visibility: "visible",
    opacity: 1,
    backgroundColor: "#000",
  }}
>
  {/* Background layers */}
  <div
    className="bg"
    style={{
      backgroundImage: "url('/bannerr.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 0,
    }}
  />
  <div
    className="image-clip"
    style={{
      backgroundImage: "url('/banner.webp')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 30%, 40% 0%)",
      zIndex: 1,
    }}
  />

  {/* Vertical scroll indicator */}
  <div
  className="absolute left-1/2 -translate-x-1/2"
  style={{
    width: "8px",
    height: "80px",
    bottom:18,
    background: "rgba(255,255,255,0.7)",
    borderRadius: "1px",
    zIndex: 20,
    boxShadow: "0 0 8px 2px rgba(255,255,255,0.2)",
    animation: "scroll-indicator-blink 1.2s infinite alternate"
  }}
/>
{/* Glassmorphism Card */}
<div
  className="glass-card"
  style={{
    position: "fixed",
    top: "50%",
    left: "20%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(20px)",
    width: "90%", // ✅ Responsive width
    maxWidth: "420px", // ✅ Prevents it from getting too big
    zIndex: 10,
    padding: "16px",
    borderRadius: "20px",
    overflow: "hidden",
  }}
>
  <p
    className="text-white mb-1"
    style={{
      fontFamily: "sans-serif",
      fontSize: "clamp(0.9rem, 2.5vw, 1rem)", // ✅ Responsive font
      lineHeight: "1.4rem",
    }}
  >
    Explore the Magic of Ghibli.
  </p>

  <h1
    className="text-white font-extrabold leading-tight mb-2"
    style={{
      fontFamily: "sans-serif",
      fontSize: "clamp(1.8rem, 6vw, 2.8rem)", // ✅ Scales on small/large screens
      lineHeight: "1.1",
    }}
  >
    Dreams and <br /> Adventure Await
  </h1>

  <p
    className="text-white mb-6"
    style={{
      fontFamily: "sans-serif",
      fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
      lineHeight: "1.5rem",
    }}
  >
    Step into Studio Ghibli's enchanting world, where stunning landscapes,
    heartfelt stories, and unforgettable characters come to life.
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap", // ✅ Buttons stack if screen is narrow
      gap: "10px",
    }}
  >
    <button
      style={{
        background: "#fff",
        color: "#000",
        fontFamily: "sans-serif",
        fontWeight: "500",
        padding: "10px 20px",
        borderRadius: "12px",
        fontSize: "0.9rem",
        cursor: "pointer",
        flex: "1 1 auto", // ✅ Makes buttons responsive
      }}
    >
      Explore more
    </button>
    <button
      style={{
        background: "rgba(30,30,30,0.9)",
        color: "#fff",
        fontFamily: "sans-serif",
        fontWeight: "500",
        padding: "10px 20px",
        borderRadius: "12px",
        fontSize: "0.9rem",
        cursor: "pointer",
        flex: "1 1 auto",
      }}
    >
      Watch now
    </button>
  </div>
</div>
</section>

  {/* Section 2 - Lazy loaded Three.js scene with loader */}
  <LazyGhibliSection />

{/* Section 3 */}
<section className="section3">
  <div className="relative z-20">
    <div className="inner">
      {/* your section content */}
    </div>
  </div>

  {/* GitHub Logo (bottom-right above footer) */}
  <a
    href="https://github.com/Sohaibgillani6789"
    target="_blank"
    rel="noopener noreferrer"
    className="github-logo"
  >
    <img
      src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      alt="GitHub"
    />
  </a>

  {/* Footer */}
  <footer className="footer">
    Made with <span className="heart">❤️</span> by Soahib Gillani
  </footer>
</section>

      {/* Global CSS */}
      <style jsx global>{`
        @keyframes scroll-indicator-blink {
          0% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        body {
          margin: 0;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
        button:focus {
          outline: 2px solid #fff;
        }
        .outer {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .inner {
          text-align: center;
          max-width: 800px;
          padding: 2rem;
          overflow: hidden;
        }

        .section-heading {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
