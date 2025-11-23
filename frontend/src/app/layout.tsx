import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n/i18n-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auto-École - Système de Gestion",
  description: "Système complet de gestion d'auto-école conforme à la réglementation française",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
