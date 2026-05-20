import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
}

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  external,
}: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:opacity-40 disabled:pointer-events-none",
    variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
    variant === "secondary" && "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700",
    variant === "ghost" && "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
    variant === "outline" && "border border-zinc-700 text-zinc-300 hover:border-indigo-500 hover:text-indigo-400",
    size === "sm" && "h-8 px-3 text-sm",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-6 text-base",
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={base}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}
