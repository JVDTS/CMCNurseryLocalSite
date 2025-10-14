import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLocation } from "wouter"; // only a hook, not a component

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  /** optional; if omitted we read from wouter useLocation() */
  activeHref?: string;
  /** theme */
  baseColor?: string;           // track color (usually your brand)
  pillColor?: string;           // pill button background
  hoveredPillTextColor?: string;
  pillTextColor?: string;       // text color on pill
  ease?: string;                // e.g. "power3.easeOut"
}

const TRACK_H = 42;   // px
const GAP = 3;        // px (between pills)
const PADDING = 3;    // px (track inner padding)
const PILL_H = TRACK_H - PADDING * 2; // 36

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  baseColor = "#f97316",           // Tailwind orange-500 vibe
  pillColor = "#ffffff",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "#0f172a",       // slate-900-ish
  ease = "power3.easeOut",
}) => {
  const [location, navigate] = useLocation();
  const current = (activeHref ?? location) || "/";

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);

  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  // normalize path compare (handles trailing slashes)
  const eq = (a: string, b: string) =>
    a.replace(/\/+$/, "") === b.replace(/\/+$/, "");

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;

        // Circle math to fill entire pill on hover
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(layout).catch(() => {});
    }

    // initial reveal of nav items (subtle)
    const navItems = navItemsRef.current;
    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: "hidden" });
      gsap.to(navItems, { width: "auto", duration: 0.6, ease });
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.2, ease, overwrite: "auto" });
  };

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Logo */}
      <a
        href={items?.[0]?.href || "/"}
        aria-label="Home"
        onMouseEnter={handleLogoEnter}
        onClick={go(items?.[0]?.href || "/")}
        ref={logoRef}
        style={{
          width: TRACK_H,
          height: TRACK_H,
          borderRadius: 9999,
          background: baseColor,
          padding: 8,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img src={logo} alt={logoAlt} ref={logoImgRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </a>

      {/* Track with pills */}
      <div
        ref={navItemsRef}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          height: TRACK_H,
          background: baseColor,
          borderRadius: 9999,
        }}
      >
        <ul
          role="menubar"
          style={{
            listStyle: "none",
            display: "flex",
            alignItems: "stretch",
            gap: GAP,
            margin: 0,
            padding: PADDING,
            height: "100%",
          }}
        >
          {items.map((item, i) => {
            const active = eq(current, item.href);
            return (
              <li key={item.href} role="none" style={{ display: "flex", height: "100%" }}>
                <a
                  href={item.href}
                  role="menuitem"
                  aria-label={item.ariaLabel || item.label}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  onClick={go(item.href)}
                  className={active ? "is-active" : undefined}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: PILL_H,
                    padding: "0 18px",
                    background: pillColor,
                    color: pillTextColor,
                    textDecoration: "none",
                    borderRadius: 9999,
                    boxSizing: "border-box",
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: 0.2,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {/* Hover fill circle */}
                  <span
                    aria-hidden="true"
                    ref={(el) => (circleRefs.current[i] = el)}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 0,
                      borderRadius: "50%",
                      background: baseColor,
                      zIndex: 1,
                      display: "block",
                      pointerEvents: "none",
                      willChange: "transform",
                    }}
                  />
                  {/* Label stack */}
                  <span style={{ position: "relative", display: "inline-block", lineHeight: 1, zIndex: 2 }}>
                    <span className="pill-label" style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover"
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        color: hoveredPillTextColor,
                        display: "inline-block",
                        opacity: 0, // GSAP will handle
                      }}
                    >
                      {item.label}
                    </span>
                  </span>

                  {/* Active dot */}
                  {active && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        bottom: -6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 12,
                        height: 12,
                        background: baseColor,
                        borderRadius: 50,
                        zIndex: 4,
                      }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
