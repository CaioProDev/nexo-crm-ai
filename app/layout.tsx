import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { CRMProvider } from "@/components/crm-provider";

export const metadata: Metadata = {
  title: "Nexo CRM — Inteligência comercial",
  description: "CRM inteligente para priorizar oportunidades e acelerar vendas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <CRMProvider>
          <AppShell>{children}</AppShell>
        </CRMProvider>
      </body>
    </html>
  );
}
