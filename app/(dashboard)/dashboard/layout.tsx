import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "WINNIT OS — Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
