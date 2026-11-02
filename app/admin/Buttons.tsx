"use client";

import { useFormStatus } from "react-dom";

// Bouton désactivé pendant l’envoi, pour éviter les doubles enregistrements.
export function Submit({ children, pendingText = "Enregistrement…", className }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending ? pendingText : children}</button>;
}

export function Confirm({ children, message, className = "admin-danger" }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
