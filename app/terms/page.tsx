import type { Metadata } from "next";

import { LegalPageShell } from "@/components/public-site/CosmicSite";

export const metadata: Metadata = {
  title: "Terms — Zodiac Love Check",
  description: "Развлекательный дисклеймер для public website и Telegram Mini App.",
  openGraph: {
    title: "Terms — Zodiac Love Check",
    description: "Контент предназначен для развлечения и саморефлексии, не для профессиональных решений.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms"
      description="Короткие условия и дисклеймер для мистического public website."
    >
      <p>Материалы сайта и Telegram Mini App предназначены для развлечения, эстетического опыта и саморефлексии.</p>
      <p>Контент не является медицинской, юридической, финансовой или психологической консультацией.</p>
      <p>Пользователь самостоятельно принимает решения и несёт ответственность за действия вне приложения.</p>
      <p>Мы избегаем фатальных обещаний, категоричных предсказаний и манипулятивного языка страха.</p>
    </LegalPageShell>
  );
}
