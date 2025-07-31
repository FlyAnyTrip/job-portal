import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./Badge.css"; // new CSS file

const badgeVariants = cva(
  "badge-base", // ⬅ using a base class from CSS
  {
    variants: {
      variant: {
        default: "badge-default",
        secondary: "badge-secondary",
        destructive: "badge-destructive",
        outline: "badge-outline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
