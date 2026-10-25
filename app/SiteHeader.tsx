"use client";

import { useState } from "react";
import Image from "next/image";

const links = [
  ["Le cabinet", "#cabinet"],
  ["Nos services", "#services"],
  ["Nos publics", "#publics"],
  ["Notre approche", "#approche"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <a className="brand" href="#accueil" onClick={() => setOpen(false)}>
        <Image src="/logo.jpg" alt="Logo du CAMS" width={1280} height={1080} priority />
        <span>CAMS<small>Cabinet d’Accompagnement<br />et de Management Social</small></span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >{open ? "×" : "☰"}</button>
      <nav id="site-navigation" className={`site-nav${open ? " is-open" : ""}`} aria-label="Navigation principale">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <a className="nav-cta" href="#contact">Prendre rendez-vous <span>↗</span></a>
    </header>
  );
}