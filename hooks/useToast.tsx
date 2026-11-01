"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  toast: (options: {
    message: string;
    type?: ToastType;
    title?: string;
    duration?: number;
  }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      message,
      type = "info",
      title,
      duration = 4000,
    }: {
      message: string;
      type?: ToastType;
      title?: string;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, message, type, title, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "success" }),
    [toast]
  );

  const error = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "error" }),
    [toast]
  );

  const warning = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "warning" }),
    [toast]
  );

  const info = useCallback(
    (message: string, title?: string) => toast({ message, title, type: "info" }),
    [toast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, toast, success, error, warning, info, removeToast }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
