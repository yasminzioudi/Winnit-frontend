import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastContainer } from "@/components/ui/Toast";
import { RegisterSW } from "@/components/RegisterSW";

/*
 * LOCAL FONTS NOTE (SWITCH TO next/font/local IN 5 LINES):
 * import localFont from "next/font/local";
 * const sans = localFont({ src: "./fonts/Inter.woff2", variable: "--font-sans" });
 * const mono = localFont({ src: "./fonts/JetBrainsMono.woff2", variable: "--font-mono" });
 * Add className={`${sans.variable} ${mono.variable}`} to <body>
 */

export const metadata: Metadata = {
  title: "WINNIT OS — Profit & E-Commerce Growth",
  description: "Système d'exploitation financière et de rentabilité pour e-commerçants COD en Tunisie",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('winnit_theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen">
        <ToastProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
