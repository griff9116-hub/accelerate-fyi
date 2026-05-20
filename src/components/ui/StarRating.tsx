"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export function StarRating({
  rating,
  max = 5,
  size = "sm",
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5",
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600",
            interactive && "cursor-pointer hover:text-amber-300 transition-colors"
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
