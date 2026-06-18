import type { ElementType, ReactNode } from "react";
import { Crown, ArrowLeft, HeartHandshake, Star, Sparkles, MapPin, CalendarDays, Lock } from "lucide-react";
import type { 
  NatalChart, 
  CompatibilityResult, 
  CoupleCalendarDay, 
  MonthForecast, 
  NameProfile, 
  NumerologyProfile, 
  AngelNumberProfile, 
  DailyTalismanProfile, 
  ZodiacVipConfig, 
  ZodiacSign 
} from "./ZodiacCompatibilityMiniApp";
import { synthesizeVipMysticDay } from "@/lib/zodiac-vip-content";
import type { ZodiacSignId } from "@/lib/zodiac-mystic-content";

interface VipStatusPillProps {
  publicMode: boolean;
  label: string;
  value: string;
}

function VipStatusPill({ publicMode, label, value }: VipStatusPillProps) {
  return (
    <div className={publicMode ? "rounded-md border border-white/10 bg-white/5 p-2" : "rounded-md border border-amber-100 bg-amber-50/50 p-2"}>
      <p className={publicMode ? "text-[10px] font-semibold uppercase tracking-wider text-slate-400" : "text-[10px] font-semibold uppercase tracking-wider text-slate-500"}>{label}</p>
      <p className={publicMode ? "mt-0.5 text-sm font-semibold text-white" : "mt-0.5 text-sm font-semibold text-slate-900"}>{value}</p>
    </div>
  );
}

function SectionHeading({ title, publicMode }: { title: string; publicMode: boolean }) {
  return (
    <h3 className={publicMode ? "mt-6 text-sm font-semibold uppercase tracking-widest text-slate-400" : "mt-6 text-sm font-semibold uppercase tracking-widest text-slate-500"}>
      {title}
    </h3>
  );
}

function VipCardButton({
  title,
  text,
  icon: Icon,
  publicMode,
  onClick,
  locked = false,
}: {
  title: string;
  text: string;
  icon: ElementType;
  publicMode: boolean;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={
        publicMode
          ? `flex min-h-[88px] w-full flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200/40 ${
              locked ? "border-white/5 bg-white/5 opacity-60" : "border-white/10 bg-white/10 hover:border-amber-200/35 hover:bg-white/10"
            }`
          : `flex min-h-[88px] w-full flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200 ${
              locked ? "border-slate-200 bg-slate-50 opacity-60" : "border-amber-100 bg-white hover:border-amber-300"
            }`
      }
    >
      <div className="flex items-center gap-2">
        <Icon className={publicMode ? "h-4 w-4 text-amber-200" : "h-4 w-4 text-amber-500"} />
        <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>{title}</p>
      </div>
      <p className={publicMode ? "mt-1.5 text-xs leading-5 text-slate-300" : "mt-1.5 text-xs leading-5 text-slate-600"}>{text}</p>
    </button>
  );
}

export function VipMenuCard({
  publicMode,
  config,
  untilLabel,
  pairReady,
  natalReady,
  nameReady,
  onFeatureOpen,
}: {
  publicMode: boolean;
  config: ZodiacVipConfig;
  untilLabel: string;
  pairReady: boolean;
  natalReady: boolean;
  nameReady: boolean;
  onFeatureOpen: (feature: string) => void;
}) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-950"}>👑 VIP открыт бесплатно</p>
          <p className={publicMode ? "mt-1 text-sm font-semibold text-amber-100" : "mt-1 text-sm font-semibold text-amber-800"}>Ранний доступ до {untilLabel}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>
            На период запуска все премиум-функции открыты бесплатно. Позже они войдут в подписку.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-black/20 text-amber-100">
          <Crown className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VipStatusPill publicMode={publicMode} label="Сейчас" value="бесплатно" />
        <VipStatusPill publicMode={publicMode} label="Доступ до" value={untilLabel} />
        <VipStatusPill publicMode={publicMode} label="Подписка" value={config.vipPaymentsEnabled || config.telegramStarsEnabled ? "позже" : "не нужна сейчас"} />
      </div>

      <SectionHeading title="1. Личный VIP" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Star} title="Расширенная натальная карта" text={natalReady ? "Полный разбор личности, любви, денег и теней" : "Частичный режим (добавьте дату для глубины)"} onClick={() => onFeatureOpen("vipNatalChart")} />
        <VipCardButton publicMode={publicMode} icon={MapPin} title="Месячный прогноз" text="Энергия, риск, любовь и лучший период месяца" onClick={() => onFeatureOpen("vipMonthForecast")} />
        <VipCardButton publicMode={publicMode} icon={Crown} title="Расширенный именной профиль" text={nameReady ? "Глубокий анализ имени, рисков и стиля общения" : "Добавьте имя для расшифровки"} onClick={() => onFeatureOpen("vipNameProfile")} />
      </div>

      <SectionHeading title="2. Любовь и пара" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={HeartHandshake} title="Расширенная совместимость" text={pairReady ? "Детальный разбор быта, общения и рисков" : "Выберите два знака, чтобы открыть"} onClick={() => onFeatureOpen("vipCompatibility")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="Ментальная карта пары" text={pairReady ? "Динамика споров, доверия и примирения" : "Нужна выбранная пара для персональной карты"} onClick={() => onFeatureOpen("vipMentalMap")} />
        <VipCardButton publicMode={publicMode} icon={CalendarDays} title="30-дневный календарь пары" text={pairReady ? "Прогноз динамики на месяц вперед" : "Доступно для пары"} onClick={() => onFeatureOpen("vipCoupleCalendar")} />
        <VipCardButton publicMode={publicMode} icon={HeartHandshake} title="Помощник сообщений" text="Готовые решения для диалога и примирения" onClick={() => onFeatureOpen("vipMessageHelper")} />
      </div>

      <SectionHeading title="3. Мистика и числа" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Star} title="Расширенная нумерология" text="Число пути, имени и личный месяц" onClick={() => onFeatureOpen("vipNumerology")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="Толкование ангельских чисел" text="Глубокий разбор числовых паттернов" onClick={() => onFeatureOpen("vipAngelNumbers")} />
        <VipCardButton publicMode={publicMode} icon={Star} title="Талисманы и символы силы" text="Камень, цвет, число и действие дня" onClick={() => onFeatureOpen("vipTalismans")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="VIP мистический день" text="Синтез дня: Таро, руна, цвет и совет" onClick={() => onFeatureOpen("vipMysticDay")} />
      </div>

      <SectionHeading title="4. Скоро" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Lock} locked title="Розыгрыши (Скоро)" text="Доступ к премиум-розыгрышам" onClick={() => {}} />
      </div>
    </div>
  );
}

function VipScreenLayout({ publicMode, title, onBack, children }: { publicMode: boolean; title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-black/40 p-4" : "rounded-lg border border-slate-200 bg-white p-4 shadow-sm"}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack} className={publicMode ? "rounded-full p-2 hover:bg-white/10 text-white" : "rounded-full p-2 hover:bg-slate-100 text-slate-700"}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className={publicMode ? "text-lg font-bold text-amber-200" : "text-lg font-bold text-slate-900"}>{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoBlock({ title, text, publicMode }: { title: string; text: string; publicMode: boolean }) {
  return (
    <div className={publicMode ? "rounded-lg bg-white/5 p-3" : "rounded-lg bg-slate-50 border border-slate-100 p-3"}>
      <h3 className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{title}</h3>
      <p className={publicMode ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-700"}>{text}</p>
    </div>
  );
}

function VipReadinessBlock({ publicMode, lead, items }: { publicMode: boolean; lead: string; items: Array<{ title: string; text: string }> }) {
  return (
    <>
      <p className={publicMode ? "text-sm leading-6 text-slate-300" : "text-sm leading-6 text-slate-600"}>{lead}</p>
      <div className="grid gap-3">
        {items.map((item) => (
          <InfoBlock key={item.title} publicMode={publicMode} title={item.title} text={item.text} />
        ))}
      </div>
    </>
  );
}

export function ExtendedNatalFeature({ publicMode, natalChart, onBack }: { publicMode: boolean; natalChart: NatalChart | null; onBack: () => void }) {
  if (!natalChart) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Расширенная натальная карта" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="VIP-разбор уже открыт бесплатно: дата нужна только для точной персонализации карты."
          items={[
            { title: "Что появится в полном режиме", text: "Архетип личности, стиль общения, любовь, сильные стороны, зона роста, личный компас и тени, которые лучше не усиливать." },
            { title: "Как получить точность", text: "Добавьте дату рождения в профиле. Время и город можно оставить пустыми, если нужен мягкий, но не технически точный разбор." },
            { title: "Приватность", text: "Дата используется только на экране для расчета и не отправляется в аналитику как значение." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная натальная карта" onBack={onBack}>
      <InfoBlock publicMode={publicMode} title="Личность" text={natalChart.archetype} />
      <InfoBlock publicMode={publicMode} title="Эмоции и стиль общения" text={natalChart.communicationStyle} />
      <InfoBlock publicMode={publicMode} title="Любовь" text={natalChart.loveStyle} />
      <InfoBlock publicMode={publicMode} title="Сильные стороны" text={natalChart.strengths} />
      <InfoBlock publicMode={publicMode} title="Зона роста" text={natalChart.growth} />
      {natalChart.compass && (
        <>
          <InfoBlock publicMode={publicMode} title="Личный компас" text={natalChart.compass.actions.join("; ")} />
          <InfoBlock publicMode={publicMode} title="Тени (чего избегать)" text={natalChart.compass.risks.join("; ")} />
        </>
      )}
      {natalChart.vipBlocks?.map((block, i) => (
        <InfoBlock key={i} publicMode={publicMode} title={block.title} text={block.text} />
      ))}
    </VipScreenLayout>
  );
}

export function ExtendedCompatibilityFeature({ publicMode, result, pairReady, onBack }: { publicMode: boolean; result: CompatibilityResult | null; pairReady: boolean; onBack: () => void }) {
  if (!pairReady || !result) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Расширенная совместимость" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="Расширенная совместимость открыта бесплатно; для личного результата нужны только два знака."
          items={[
            { title: "Что будет в разборе", text: "Процент гармонии, любовь, общение, быт, притяжение, сильные стороны, зоны риска и главный совет для пары." },
            { title: "Без лишних данных", text: "Можно начать только со знаков. Имена, даты и время рождения не обязательны для базового VIP-результата." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная совместимость" onBack={onBack}>
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold text-amber-500">{result.scores.total}%</div>
        <div className={publicMode ? "text-slate-300" : "text-slate-600"}>Общий показатель гармонии пары</div>
      </div>
      <InfoBlock publicMode={publicMode} title="Любовь и чувства" text={result.loveText} />
      <InfoBlock publicMode={publicMode} title="Общение и диалог" text={result.communicationText} />
      <InfoBlock publicMode={publicMode} title="Быт и привычки" text={result.householdText} />
      <InfoBlock publicMode={publicMode} title="Притяжение и интересы" text={result.attractionText} />
      <InfoBlock publicMode={publicMode} title="Сильные стороны пары" text={result.strengthText} />
      <InfoBlock publicMode={publicMode} title="Зоны риска и напряжения" text={result.weakSpotText} />
      <InfoBlock publicMode={publicMode} title="Главный совет" text={result.adviceText} />
    </VipScreenLayout>
  );
}

export function VipMentalMapFeature({ publicMode, result, pairReady, onBack }: { publicMode: boolean; result: CompatibilityResult | null; pairReady: boolean; onBack: () => void }) {
  if (!pairReady || !result) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Ментальная карта пары" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="Ментальная карта показывает не совместимость в целом, а то, как пара думает, спорит и возвращается к контакту."
          items={[
            { title: "Слои карты", text: "Отдельно раскрываются мышление, спорные сценарии, примирение, укрепляющие привычки и то, что снижает доверие." },
            { title: "Что нужно", text: "Выберите два знака в разделе любви, чтобы карта стала персональной, без платежей и подписки." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Ментальная карта пары" onBack={onBack}>
      <InfoBlock publicMode={publicMode} title="Как вы думаете" text={result.mentalMapDynamics[0]?.text || result.mentalMapSummary.strengths} />
      <InfoBlock publicMode={publicMode} title="Как вы спорите" text={result.mentalMapDynamics[1]?.text || result.mentalMapSummary.risks} />
      <InfoBlock publicMode={publicMode} title="Как вы миритесь" text={result.mentalMapDynamics[2]?.text || result.mentalMapSummary.advice} />
      <InfoBlock publicMode={publicMode} title="Что укрепляет контакт" text={result.mentalMapSummary.helps.join("; ")} />
      <InfoBlock publicMode={publicMode} title="Что разрушает доверие" text={result.mentalMapSummary.avoid.join("; ")} />
    </VipScreenLayout>
  );
}

export function VipCoupleCalendarFeature({ publicMode, calendarDays, pairReady, onBack }: { publicMode: boolean; calendarDays: CoupleCalendarDay[]; pairReady: boolean; onBack: () => void }) {
  if (!pairReady) {
    return (
      <VipScreenLayout publicMode={publicMode} title="30-дневный календарь пары" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="30-дневный календарь открыт в раннем VIP-доступе и строится после выбора пары."
          items={[
            { title: "Что внутри", text: "Дни для разговоров, свиданий, осторожности, примирения и совместных решений на ближайший месяц." },
            { title: "Как использовать", text: "Смотрите не как жесткое расписание, а как мягкую карту темпа: когда лучше говорить, а когда дать друг другу больше воздуха." },
            { title: "Доступ", text: "До 17.09.2026 календарь работает бесплатно и не требует Telegram Stars." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="30-дневный календарь пары" onBack={onBack}>
      <p className={publicMode ? "mb-2 text-sm text-slate-300" : "mb-2 text-sm text-slate-600"}>Ключевые дни для вашей пары в ближайший месяц:</p>
      <div className="space-y-3">
        {calendarDays.slice(0, 15).map((day, i) => (
          <div key={i} className={publicMode ? "rounded-lg bg-white/5 p-3 border-l-2 border-amber-400" : "rounded-lg bg-slate-50 p-3 border-l-2 border-amber-400"}>
            <div className="flex justify-between items-center mb-1">
              <span className={publicMode ? "font-semibold text-white" : "font-semibold text-slate-900"}>{day.date}</span>
              <span className="text-xs uppercase tracking-wider text-amber-500 font-bold">{day.weekday}</span>
            </div>
            <p className={publicMode ? "text-sm text-slate-300 font-medium" : "text-sm text-slate-700 font-medium"}>{day.status}</p>
            <p className={publicMode ? "text-xs text-slate-400 mt-1" : "text-xs text-slate-500 mt-1"}>{day.advice}</p>
          </div>
        ))}
        {calendarDays.length > 15 && (
          <p className={publicMode ? "text-xs text-center text-slate-400" : "text-xs text-center text-slate-500"}>И еще {calendarDays.length - 15} дней в вашем календаре...</p>
        )}
      </div>
    </VipScreenLayout>
  );
}

export function VipMonthForecastFeature({ publicMode, monthForecast, onBack }: { publicMode: boolean; monthForecast: MonthForecast | null; onBack: () => void }) {
  if (!monthForecast) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Месячный прогноз" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="Месячный VIP-прогноз готовит обзор месяца после выбора знака."
          items={[
            { title: "Структура прогноза", text: "Главная тема, любовь, деньги и дела, энергия, возможный риск, лучший период и практичный совет." },
            { title: "Для кого", text: "Подходит для спокойного планирования месяца без точных персональных данных и без оплаты." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Месячный прогноз" onBack={onBack}>
      <InfoBlock publicMode={publicMode} title="Главная тема месяца" text={monthForecast.theme} />
      <InfoBlock publicMode={publicMode} title="Любовь и отношения" text={monthForecast.love} />
      <InfoBlock publicMode={publicMode} title="Деньги и дела" text={monthForecast.money} />
      <InfoBlock publicMode={publicMode} title="Энергия и здоровье" text={monthForecast.energy} />
      <InfoBlock publicMode={publicMode} title="Возможные риски" text={monthForecast.risk} />
      <InfoBlock publicMode={publicMode} title="Лучший период" text={monthForecast.bestPeriod} />
      <InfoBlock publicMode={publicMode} title="Главный совет" text={monthForecast.advice} />
    </VipScreenLayout>
  );
}

export function VipMessageHelperFeature({ publicMode, messageVariants, pairReady, onBack }: { publicMode: boolean; messageVariants: Array<{ label: string; text: string }>; pairReady: boolean; onBack: () => void }) {
  if (!pairReady) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Помощник сообщений" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="Помощник сообщений открыт бесплатно, но личные фразы появляются только после выбора пары."
          items={[
            { title: "Что будет внутри", text: "Готовые варианты для мягкого сообщения, романтического тона, разговора после ссоры, приглашения и честного диалога." },
            { title: "Почему нужна пара", text: "Текст зависит от двух знаков и динамики совместимости, поэтому без пары приложение не подставляет синтетический результат." },
            { title: "Доступ", text: "Функция остается бесплатной до 17.09.2026 и не требует Telegram Stars." },
          ]}
        />
      </VipScreenLayout>
    );
  }

  return (
    <VipScreenLayout publicMode={publicMode} title="Помощник сообщений" onBack={onBack}>
      <p className={publicMode ? "text-sm text-slate-300 mb-4" : "text-sm text-slate-600 mb-4"}>Используйте эти фразы для гармоничного общения с вашим партнером:</p>
      <div className="space-y-3">
        {messageVariants.map((variant, i) => (
          <InfoBlock key={i} publicMode={publicMode} title={variant.label} text={variant.text} />
        ))}
      </div>
    </VipScreenLayout>
  );
}

export function ExtendedNameProfileFeature({ publicMode, nameProfile, onBack }: { publicMode: boolean; nameProfile: NameProfile | null; onBack: () => void }) {
  if (!nameProfile) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Расширенный именной профиль" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="Именной профиль открыт бесплатно, но ему нужно имя, чтобы не показывать выдуманную персонализацию."
          items={[
            { title: "Что раскроется", text: "Внутренний портрет, сильные стороны, риски, стиль общения, отношения, работа и совет месяца." },
            { title: "Безопасность", text: "Имя используется только для расчета на экране; аналитика получает только флаг наличия имени, а не само имя." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенный именной профиль" onBack={onBack}>
      <InfoBlock publicMode={publicMode} title="Внутренний портрет" text={nameProfile.portrait} />
      {nameProfile.vipBlocks.map((block, i) => (
        <InfoBlock key={i} publicMode={publicMode} title={block.title} text={block.text} />
      ))}
    </VipScreenLayout>
  );
}

export function ExtendedNumerologyFeature({ publicMode, numerology, onBack }: { publicMode: boolean; numerology: NumerologyProfile; onBack: () => void }) {
  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная нумерология" onBack={onBack}>
      <div className="flex flex-wrap gap-3 mb-4">
        {numerology.lifePath && <VipStatusPill publicMode={publicMode} label="Путь" value={String(numerology.lifePath)} />}
        {numerology.nameNumber && <VipStatusPill publicMode={publicMode} label="Имя" value={String(numerology.nameNumber)} />}
        {numerology.personalMonth && <VipStatusPill publicMode={publicMode} label="Месяц" value={String(numerology.personalMonth)} />}
        <VipStatusPill publicMode={publicMode} label="День" value={String(numerology.dayNumber)} />
      </div>
      <InfoBlock publicMode={publicMode} title="Сильные стороны чисел" text={numerology.strengths} />
      <InfoBlock publicMode={publicMode} title="Скрытые риски" text={numerology.risks} />
      <InfoBlock publicMode={publicMode} title="Деньги и любовь" text={numerology.summary} />
      <InfoBlock publicMode={publicMode} title="Совет по вашим числам" text={numerology.advice} />
    </VipScreenLayout>
  );
}

export function ExtendedAngelNumberFeature({ publicMode, angelNumber, onBack }: { publicMode: boolean; angelNumber: AngelNumberProfile; onBack: () => void }) {
  if (!angelNumber.isValid) {
    return (
      <VipScreenLayout publicMode={publicMode} title="Ангельские числа" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="VIP-толкование ангельских чисел разбирает повторяющиеся и зеркальные паттерны."
          items={[
            { title: "Примеры", text: "Введите 11:11, 22:22, 12:21 или похожую комбинацию времени, которую вы часто замечаете." },
            { title: "Что будет в результате", text: "Любовь, дела, интуиция, действие, осторожность, знак дня и связь с текущей энергией." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Толкование ангельских чисел" onBack={onBack}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl font-bold tracking-widest text-amber-500">{angelNumber.safeKey}</div>
        <div className={publicMode ? "text-slate-300" : "text-slate-600"}>{angelNumber.label}</div>
      </div>
      {angelNumber.vipBlocks.map((block, i) => (
        <InfoBlock key={i} publicMode={publicMode} title={block.title} text={block.text} />
      ))}
    </VipScreenLayout>
  );
}

export function VipTalismansFeature({ publicMode, dailyTalisman, selfSign, onBack }: { publicMode: boolean; dailyTalisman: DailyTalismanProfile | null; selfSign: ZodiacSign | null; onBack: () => void }) {
  if (!dailyTalisman) {
    return (
      <VipScreenLayout publicMode={publicMode} title="VIP талисманы и символы" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="VIP-талисманы показывают мягкие символы дня после выбора знака."
          items={[
            { title: "Что внутри", text: "Камень силы, цвет дня, счастливое число, тотем, фраза силы и действие, которое поддержит настрой." },
            { title: "Как читать", text: "Это не обещание результата, а аккуратная подсказка для фокуса, настроения и маленького ежедневного ритуала." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  return (
    <VipScreenLayout publicMode={publicMode} title="Талисманы и символы силы" onBack={onBack}>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBlock publicMode={publicMode} title="Камень силы" text={dailyTalisman.stone} />
        <InfoBlock publicMode={publicMode} title="Цвет дня" text={dailyTalisman.color} />
        <InfoBlock publicMode={publicMode} title="Счастливое число" text={String(dailyTalisman.number)} />
        <InfoBlock publicMode={publicMode} title="Тотем" text={selfSign ? `${selfSign.emoji} ${selfSign.name}` : "Личный тотем"} />
      </div>
      <div className="mt-3">
        <InfoBlock publicMode={publicMode} title="Фраза силы на день" text={dailyTalisman.phrase} />
        <div className="mt-3" />
        <InfoBlock publicMode={publicMode} title="Действие, которое принесет удачу" text={dailyTalisman.action} />
      </div>
    </VipScreenLayout>
  );
}

export function VipMysticDayFeature({ publicMode, dateKey, sign, angelNumber, onBack }: { publicMode: boolean; dateKey: string; sign: ZodiacSign | null; angelNumber: AngelNumberProfile; onBack: () => void }) {
  if (!sign) {
    return (
      <VipScreenLayout publicMode={publicMode} title="VIP Мистический день" onBack={onBack}>
        <VipReadinessBlock
          publicMode={publicMode}
          lead="VIP мистический день объединяет несколько мистических разделов в один короткий синтез."
          items={[
            { title: "Состав синтеза", text: "Карта дня, Таро, руна, цвет ауры, ангельское число при наличии и главный интуитивный совет." },
            { title: "Что нужно", text: "Достаточно выбрать знак. Остальные элементы рассчитываются по дате и не требуют личных вводов." },
          ]}
        />
      </VipScreenLayout>
    );
  }
  
  const synthesis = synthesizeVipMysticDay(dateKey, sign.slug as ZodiacSignId, angelNumber);
  
  return (
    <VipScreenLayout publicMode={publicMode} title="VIP Мистический день: Синтез" onBack={onBack}>
      <p className={publicMode ? "text-sm text-slate-300 mb-4" : "text-sm text-slate-600 mb-4"}>Комплексный анализ энергий сегодняшнего дня, объединяющий Таро, руны, цвет и вашу интуицию.</p>
      <InfoBlock publicMode={publicMode} title="Таро и Карта дня" text={`${synthesis.tarotCard.card} и ${synthesis.dailyCard.title}. ${synthesis.tarotCard.mainMeaning}`} />
      <InfoBlock publicMode={publicMode} title="Руна дня" text={`${synthesis.runeDay.symbol} ${synthesis.runeDay.name}. ${synthesis.runeDay.mainMeaning}`} />
      <InfoBlock publicMode={publicMode} title="Цвет и Аура" text={`${synthesis.auraColor.color}. ${synthesis.auraColor.meaning}`} />
      {synthesis.angelNumber.isValid && (
        <InfoBlock publicMode={publicMode} title={`Синхрония чисел (${synthesis.angelNumber.safeKey})`} text={synthesis.angelNumber.label} />
      )}
      <InfoBlock publicMode={publicMode} title="Главный интуитивный совет" text={synthesis.advice} />
      <InfoBlock publicMode={publicMode} title="Чего стоит избегать" text={synthesis.warning} />
    </VipScreenLayout>
  );
}
