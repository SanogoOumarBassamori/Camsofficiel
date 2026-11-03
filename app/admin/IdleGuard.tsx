"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const IDLE_MS = 10 * 60 * 1000; // Déconnexion après 10 min sans activité.
const RENEW_MS = 2 * 60 * 1000; // On ne prolonge la session côté serveur qu’une fois toutes les 2 min.

export default function IdleGuard() {
  const router = useRouter();
  const last = useRef(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const expire = () => {
      router.push("/admin/connexion?err=" + encodeURIComponent("Vous avez été déconnecté après 10 minutes d’inactivité."));
    };
    const arm = () => { clearTimeout(timer); timer = setTimeout(expire, IDLE_MS); };
    const onActivity = () => {
      arm();
      const now = Date.now();
      if (now - last.current > RENEW_MS) {
        last.current = now;
        fetch("/admin/session", { method: "POST" }).then((r) => { if (r.status === 401) expire(); }).catch(() => undefined);
      }
    };
    const events = ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    arm();
    return () => { clearTimeout(timer); events.forEach((e) => window.removeEventListener(e, onActivity)); };
  }, [router]);
  return null;
}
