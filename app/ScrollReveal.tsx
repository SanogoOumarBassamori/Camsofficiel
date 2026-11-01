"use client";

import { useEffect } from "react";

// Blocs qui apparaissent en douceur au défilement, en cascade dans leur groupe.
const SELECTOR = ".section-head, .intro-grid > div, .values > div, .service-card, .audience-list details, .axis-grid article, .approach-left, .step, .quote, .contact-box, .empty-state, .media-photo, .media-list, .pole-card, .team-card, .page-cta";

export default function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        el.classList.add("is-in");
        // Retire la transition d'entrée ensuite pour rendre aux survols leur vitesse normale.
        timers.push(window.setTimeout(() => el.classList.remove("reveal", "is-in"), 1400));
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      const group = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(SELECTOR)) : [];
      el.style.setProperty("--reveal-delay", `${Math.min(Math.max(group.indexOf(el), 0), 5) * 90}ms`);
      el.classList.add("reveal");
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);
  return null;
}
