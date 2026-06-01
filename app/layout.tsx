import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UnifiedStatusStrip } from "@/components/UnifiedStatusStrip";

export const metadata: Metadata = {
  title: "Telegram 15 Channels",
  description: "Панель управления сетью из 15 Telegram-каналов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-[#070b14] text-slate-100 grid-surface">
          <Sidebar />
          <div className="min-h-screen lg:pl-72">
            <Header />
            <UnifiedStatusStrip />
            <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
