import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer>
      <Link className="footer-brand" href="/#accueil"><Image src="/logo.jpg" alt="" width={1280} height={1080} /> CAMS</Link>
      <span>Cabinet d’Accompagnement et de Management Social</span>
      <span>© {new Date().getFullYear()} CAMS · Côte d’Ivoire</span>
      <a href="#">Retour en haut ↑</a>
      <Link className="footer-admin" href="/admin" rel="nofollow">Espace CAMS</Link>
    </footer>
  );
}
