import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "marketflow-wishlist";

const readFavorites = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const useWishlist = () => {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const isFavorite = useMemo(() => {
    return (productId: string) => favorites.includes(productId);
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
};
