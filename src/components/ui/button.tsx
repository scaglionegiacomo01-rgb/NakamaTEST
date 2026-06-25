import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold cursor-pointer tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // CTA — coral, the action of the app
        default:
          "bg-accent text-accent-foreground shadow-[0_8px_30px_-8px_oklch(0.68_0.18_20/0.6)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-10px_oklch(0.68_0.18_20/0.7)]",
        // Magenta brand button
        brand:
          "bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_oklch(0.40_0.17_5/0.7)] hover:brightness-110 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow hover:brightness-110",
        outline:
          "border border-border bg-card/40 backdrop-blur text-foreground hover:bg-card hover:border-accent/60",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-secondary/70 text-foreground",
        link:
          "text-accent underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
