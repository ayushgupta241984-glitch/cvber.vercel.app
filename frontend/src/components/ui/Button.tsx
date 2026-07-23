"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-white text-black hover:opacity-80 active:translate-y-[1px] active:duration-100",
        default:
          "bg-white text-black hover:opacity-80 active:translate-y-[1px] active:duration-100",
        secondary:
          "border hover:opacity-80",
        outline:
          "border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]",
        ghost:
          "text-[var(--text-quaternary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-8 px-4 py-2 text-[10px]",
        lg: "h-12 px-8 py-3.5 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
