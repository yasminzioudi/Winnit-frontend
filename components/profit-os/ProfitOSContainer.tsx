import React from "react";
import { cn } from "@/lib/utils";

export interface ProfitOSContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ProfitOSContainer({ children, className = "" }: ProfitOSContainerProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto space-y-6 pb-20 md:pb-8 min-w-0", className)}>
      {children}
    </div>
  );
}

