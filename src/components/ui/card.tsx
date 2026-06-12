import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "featured" | "sponsored";
  onClick?: () => void;
}

export function Card({ children, className = "", variant = "default", onClick }: CardProps) {
  const baseStyles = "rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/50";
  const variantStyles = {
    default: baseStyles,
    featured: `${baseStyles} border-indigo-500/40`,
    sponsored: `${baseStyles} border-indigo-500/40 bg-zinc-800/30`,
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
