"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10",
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        outline:
          "border border-[#C9A962]/30 text-[#C9A962] hover:bg-[#C9A962]/5 hover:border-[#C9A962]/60",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-accent",
        gold:
          "border border-[#C9A962]/30 text-[#C9A962] hover:bg-[#C9A962]/5 hover:border-[#C9A962]/60",
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
