"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@polyglot/shared-utils";

export const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
      quiet: "button-quiet",
      warm: "button-warm",
      ghost: "button-ghost",
    },
    size: {
      default: "",
      sm: "button-sm",
      lg: "button-lg",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export const cardVariants = cva("card", {
  variants: {
    variant: {
      default: "",
      elevated: "card-elevated",
      tinted: "card-tinted",
      interactive: "card-interactive",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <section className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function Badge({
  className,
  tone = "sage",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "sage" | "warm" | "explore" | "review" | "muted";
}) {
  return <span className={cn("pill", `pill-${tone}`, className)} {...props} />;
}

export function Dialog({
  title,
  description,
  trigger,
  children,
}: {
  title: string;
  description: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content className="dialog">
          <div className="dialog-header">
            <DialogPrimitive.Title className="dialog-title">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="dialog-description">
              {description}
            </DialogPrimitive.Description>
          </div>
          <div className="dialog-body">{children}</div>
          <div className="dialog-footer">
            <DialogPrimitive.Close asChild>
              <Button variant="outline">Close</Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
