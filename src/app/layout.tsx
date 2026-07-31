import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";
import ChatWidget from "@/components/ChatWidget";
import { CartToastProvider } from "@/components/CartToast";
import MobileBottomNav from "@/components/MobileBottomNav";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AGROMIL | Moda Feminina, Vestidos, Conjuntos & Acessórios",
  description: "Descubra o melhor da moda feminina autoral na AGROMIL. Vestidos, conjuntos de alfaiataria, tops, calças e acessórios com elegância, qualidade e entrega para todo o Brasil.",
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
      className={`${plusJakartaSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5EFE6] text-[#2B2620]">
        <CartToastProvider>
          {/* Main content — extra bottom padding on mobile so bottom nav doesn't overlap */}
          <div className="flex-1 flex flex-col pb-mobile-nav md:pb-0">
            {children}
          </div>
          <MobileBottomNav />
          <PWAInstaller />
          <ChatWidget />
        </CartToastProvider>
      </body>
    </html>
  );
}
