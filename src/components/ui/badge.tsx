import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
        active: "border-primary/30 bg-primary/15 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLButtonElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <button type="button" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
