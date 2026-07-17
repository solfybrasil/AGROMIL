import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import ChatWidget from "@/components/ChatWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Agromil Agropecuária - Itu/SP | Loja & Agropecuária Geral",
  description: "Encontre tudo em jardinagem, pet shop, ferramentas, irrigação e insumos agropecuários na Agromil em Itu/SP. Qualidade e tradição para sua casa e campo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agromil",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfdfb] text-[#1a2f23]">
        {children}
        <PWAInstaller />
        <ChatWidget />
      </body>
    </html>
  );
}
