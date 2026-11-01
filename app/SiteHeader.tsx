"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Le cabinet", "/#cabinet"],
  ["Nos services", "/#services"],
  ["Nos publics", "/#publics"],
  ["Notre approche", "/#approche"],
  ["Médiathèque", "/mediatheque"],
  ["Nos équipes", "/equipe"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
      <Link className="brand" href="/#accueil" onClick={() => setOpen(false)}>
        <Image src="/logo.jpg" alt="Logo du CAMS" width={1280} height={1080} priority />
        <span>CAMS<small>Cabinet d’Accompagnement<br />et de Management Social</small></span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >{open ? "×" : "☰"}</button>
      <nav id="site-navigation" className={`site-nav${open ? " is-open" : ""}`} aria-label="Navigation principale">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <Link className="nav-cta" href="/#contact"><b className="cta-full">Prendre rendez-vous</b><b className="cta-short">Rendez-vous</b> <span>↗</span></Link>
    </header>
  );
}