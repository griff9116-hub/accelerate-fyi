import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "red" | "accent";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-zinc-700 bg-zinc-800 text-zinc-300",
        variant === "green" && "border-green-500/20 bg-green-500/10 text-green-400",
        variant === "amber" && "border-amber-500/20 bg-amber-500/10 text-amber-400",
        variant === "red" && "border-red-500/20 bg-red-500/10 text-red-400",
        variant === "accent" && "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
        className
      )}
    >
      {children}
    </span>
  );
}
