import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const SUPABASE_STORAGE_BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public`
  : "";

const resolveSupabasePath = (path: string) => {
  if (path.startsWith("/storage/v1/object/public")) {
    return SUPABASE_URL ? `${SUPABASE_URL}${path}` : path;
  }
  if (SUPABASE_STORAGE_BASE && path.startsWith("/products/")) {
    return `${SUPABASE_STORAGE_BASE}${path}`;
  }
  return path;
};

function buildFallbackImage(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    return new URL(`../assets/products/${slug}.jpg`, import.meta.url).href;
  } catch (e) {
    return "";
  }
}

export function getProductImage(product: { image_url?: string | null; name: string }) {
  const url = product.image_url;
  if (url && typeof url === "string") {
    const trimmed = url.trim();
    if (trimmed.startsWith("http") || trimmed.startsWith("https")) {
      return trimmed;
    }
    if (trimmed.startsWith("data:")) {
      return trimmed;
    }
    if (trimmed.includes("assets")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return resolveSupabasePath(trimmed);
    }
  }

  return buildFallbackImage(product.name);
}
