import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("cs-CZ");
}

export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("cs-CZ");
}

export function formatArea(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat("cs-CZ").format(value)} m²`;
}

export function toNullableNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
