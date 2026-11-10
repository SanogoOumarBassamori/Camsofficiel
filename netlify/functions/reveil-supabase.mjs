// L'offre gratuite de Supabase se met en pause après 7 jours sans activité : une lecture par jour la garde éveillée.
export default async function reveil() {
  const key = process.env.SUPABASE_SECRET_KEY ?? "";
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/cams_store?select=key&limit=1`, {
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) },
  });
  console.log("Réveil Supabase", response.status);
}

export const config = { schedule: "@daily" };
