"use client";

/**
 * Hook simple para mostrar toasts.
 * Versión condensada del hook de shadcn/ui.
 */

import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

type ToastInput = Omit<ToastProps, "id"> & {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

interface ToasterToast extends ToastInput {
  id: string;
  open: boolean;
}

const listeners: Array<(toasts: ToasterToast[]) => void> = [];
let memoryToasts: ToasterToast[] = [];

function emit() {
  listeners.forEach((l) => l(memoryToasts));
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export function toast(props: ToastInput) {
  const id = props.id ?? genId();
  const t: ToasterToast = { ...props, id, open: true };
  memoryToasts = [t, ...memoryToasts].slice(0, 5);
  emit();
  // Auto-dismiss
  setTimeout(() => {
    memoryToasts = memoryToasts.map((x) => (x.id === id ? { ...x, open: false } : x));
    emit();
    setTimeout(() => {
      memoryToasts = memoryToasts.filter((x) => x.id !== id);
      emit();
    }, 300);
  }, 4500);
  return id;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>(memoryToasts);
  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const i = listeners.indexOf(setToasts);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { toasts, toast };
}
