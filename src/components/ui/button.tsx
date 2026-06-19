"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  shape?: "default" | "pill";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      shape = "default",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-black text-white hover:bg-[#1d1d1f] focus:ring-black",
      secondary: "bg-surface text-foreground hover:bg-border/50 focus:ring-muted",
      outline:
        "border border-foreground text-foreground hover:bg-foreground hover:text-white focus:ring-foreground",
      ghost: "text-foreground hover:bg-surface focus:ring-muted",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs tracking-wide",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-sm tracking-wide",
    };

    const shapes = {
      default: "rounded-lg",
      pill: "rounded-full",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${shapes[shape]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
