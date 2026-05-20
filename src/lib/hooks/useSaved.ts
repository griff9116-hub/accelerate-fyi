"use client";

import { useEffect, useState } from "react";

const KEY = "accelerate_saved";

function getIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useSaved(id: string) {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(getIds());
  }, []);

  const isSaved = saved.includes(id);

  function toggle() {
    const next = isSaved ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("saved-changed"));
  }

  return { isSaved, toggle };
}

export function useSavedIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getIds());
    const handler = () => setIds(getIds());
    window.addEventListener("saved-changed", handler);
    return () => window.removeEventListener("saved-changed", handler);
  }, []);

  return ids;
}
