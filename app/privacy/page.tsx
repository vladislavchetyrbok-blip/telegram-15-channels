import type { Metadata } from "next";

import { LegalPageShell } from "@/components/public-site/CosmicSite";

export const metadata: Metadata = {
  title: "Privacy — Zodiac Love Check",
  description: "Короткое описание приватности public website и Telegram Mini App.",
  openGraph: {
    title: "Privacy — Zodiac Love Check",
    description: "Public website можно смотреть без входа; Mini App может использовать Telegram context для персонализации.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy"
      description="Простое описание того, как устроен public website и переход в Telegram Mini App."
    >
      <p>Публичный сайт можно просматривать без логина и без передачи личных данных в форме на сайте.</p>
      <p>
        Когда пользователь открывает Telegram Mini App, Telegram может передать базовый контекст WebApp. Он используется для персонализации интерфейса внутри Mini App, если такой контекст доступен.
      </p>
      <p>Мы не добавляли внешнюю социальную интеграцию, рекламные токены или автоматическую публикацию в рамках Public Website V1.</p>
      <p>Не отправляйте через сайт или Mini App секреты, документы, финансовые данные или информацию, которую не хотите использовать в развлекательном формате.</p>
    </LegalPageShell>
  );
}
