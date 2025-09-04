// Safe number coercion utility
export function toUnixSeconds(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// New function to parse ISO DateTime string to UNIX seconds
export function toUnixSecondsFromISO(iso?: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);              // ← parse ISO
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

// Helper utility untuk format tanggal expiry
export const formatExpiry = (expiresAt?: number | null) =>
  !expiresAt ? "-" : new Date(expiresAt * 1000).toISOString().slice(0, 10); // YYYY-MM-DD

// Alternative format for display
export const formatExpiryLong = (expiresAt?: number | null) =>
  !expiresAt ? "Unknown" : new Date(expiresAt * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });