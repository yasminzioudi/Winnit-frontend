"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const session = localStorage.getItem("winnit_session");
      if (session) {
        router.replace("/dashboard/overview");
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 bg-grid-dots">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 animate-pulse">
          <Image
            src="/images/logo.svg"
            alt="WINNIT"
            width={48}
            height={48}
            priority
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-brand-lime" />
          <span>Initialisation de WINNIT OS...</span>
        </div>
      </div>
    </div>
  );
}
