"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="animate-in fade-in-0 slide-in-from-top-1 text-xs text-destructive duration-200">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormActionsProps {
  loading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
  return <div className="flex items-center justify-end gap-2 border-t pt-4">{children}</div>;
}
