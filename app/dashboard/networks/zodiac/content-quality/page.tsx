import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, CheckCircle2, ShieldAlert, Zap, Info, Shield, ListChecks, Link as LinkIcon, Eye } from "lucide-react";

export default function ZodiacContentQualityPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Качество контента Зодиака</h1>
        <p className="text-muted-foreground text-lg">
          Редакционный аудит действующих гороскопов: тон, структура, повторяемость, CTA, безопасность формулировок и готовность к soft launch.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Каналов
          </div>
          <div className="text-2xl font-bold">13</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> Режим
          </div>
          <div className="text-2xl font-bold text-amber-400">Аудит качества</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Публикация
          </div>
          <div className="text-2xl font-bold text-rose-500">Заблокирована</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <Info className="h-4 w-4" /> Источник
          </div>
          <div className="text-xl font-bold">Действующая ежедневная система</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Live
          </div>
          <div className="text-xl font-bold">Только вручную</div>
        </div>
        <Link href="/dashboard/networks/zodiac/template-refinement" className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900 hover:bg-slate-800 transition block">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Следующий этап
          </div>
          <div className="text-xl font-bold text-emerald-400">Улучшение шаблонов</div>
        </Link>
        <Link href="/dashboard/networks/zodiac/preview-review" className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 border-slate-800 bg-slate-900 hover:bg-slate-800 transition block">
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
            <Eye className="h-4 w-4" /> Анализ
          </div>
          <div className="text-xl font-bold text-teal-400">Preview Review</div>
        </Link>
      </div>

      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-medium text-rose-500">Статус безопасности среды (Safety block)</h4>
            <ul className="text-sm text-rose-200/70 list-disc pl-4 space-y-1">
              <li>Live-публикация отключена</li>
              <li>Telegram API не вызывается из этой страницы</li>
              <li>Токены не используются</li>
              <li>UI только показывает правила качества</li>
              <li>Действующая ежедневная система не пересоздаётся</li>
              <li>Запуск только после отдельного разрешения</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm border-slate-800 bg-slate-900">
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-emerald-500" /> Quality checklist
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Структура поста",
                  desc: "Каждый пост имеет приветствие, прогноз, совет дня и CTA.",
                  good: "«Привет, Овны! Сегодня отличный день для…»",
                  bad: "Сплошной текст без абзацев",
                  risk: "Сложно читать с телефона",
                  fix: "Использовать абзацы и эмодзи-буллиты"
                },
                {
                  title: "Тон и стиль",
                  desc: "Дружелюбный, вдохновляющий, без запугивания.",
                  good: "«Звезды советуют обратить внимание на отдых»",
                  bad: "«Вас ждут ужасные события, если не…»",
                  risk: "Отписки, негатив, бан в Telegram",
                  fix: "Заменить угрозы на возможности"
                },
                {
                  title: "Повторяемость",
                  desc: "Исключение одинаковых фраз каждый день.",
                  good: "Генерация свежих метафор и советов",
                  bad: "«Опять этот день сурка» каждый понедельник",
                  risk: "Баннерная слепота, потеря интереса",
                  fix: "Внедрить ротацию вводных конструкций"
                },
                {
                  title: "Длина Telegram-поста",
                  desc: "Оптимально для экрана смартфона (до 1000 симв).",
                  good: "1-2 экрана текста без скролла",
                  bad: "Лонгрид на 3000 символов",
                  risk: "Пользователи не дочитывают",
                  fix: "Сокращать воду, оставлять суть"
                }
              ].map((item, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-medium text-slate-200">{item.title}</h4>
                  <p className="text-sm text-slate-400 mt-1 mb-3">{item.desc}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-950/30 text-emerald-400 p-2 rounded">
                      <span className="font-bold">✓ Пример:</span><br/>{item.good}
                    </div>
                    <div className="bg-rose-950/30 text-rose-400 p-2 rounded">
                      <span className="font-bold">✗ Ошибка:</span><br/>{item.bad}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-amber-500"><span className="font-bold">Риск:</span> {item.risk}</span>
                    <span className="text-emerald-500"><span className="font-bold">Решение:</span> {item.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm border-slate-800 bg-slate-900">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-blue-500" /> Editorial rules
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> не обещать 100% событий;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> не давить страхом;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> не писать “срочно сделай” без причины;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> не давать медицинских/юридических/финансовых гарантий;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> не делать одинаковые тексты для всех знаков;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> каждый знак должен иметь свой характер;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> CTA должен быть мягким и полезным;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> текст должен быть коротким, понятным, Telegram-ready;</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> мистичность допустима, но без манипуляции.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm border-slate-800 bg-slate-900">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <LinkIcon className="h-5 w-5 text-violet-500" /> CTA library (Mini App связка)
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-emerald-500 mb-2">Безопасные примеры:</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                    <li>Сохрани прогноз и вернись к нему вечером.</li>
                    <li>Открой Mini App и проверь совместимость.</li>
                    <li>Посмотри знак близкого человека.</li>
                    <li>Подпишись, чтобы не пропустить прогноз на завтра.</li>
                    <li>Проверь свой день через общий прогноз.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-rose-500 mb-2">Опасные (запрещенные) примеры:</h4>
                  <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4 line-through">
                    <li>Срочно сделай это, иначе будет плохо.</li>
                    <li>100% сегодня случится событие.</li>
                    <li>Купи / продай / расстанься прямо сейчас.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm border-slate-800 bg-slate-900">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Отличие знаков друг от друга (Zodiac sign differentiation)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[
              { sign: "Общий гороскоп", desc: "энергия дня для всех", color: "bg-slate-800" },
              { sign: "Овен", desc: "действие, импульс, инициатива", color: "bg-rose-950/50 border-rose-900" },
              { sign: "Телец", desc: "стабильность, комфорт, деньги", color: "bg-emerald-950/50 border-emerald-900" },
              { sign: "Близнецы", desc: "общение, новости, идеи", color: "bg-yellow-950/50 border-yellow-900" },
              { sign: "Рак", desc: "эмоции, дом, интуиция", color: "bg-sky-950/50 border-sky-900" },
              { sign: "Лев", desc: "уверенность, творчество, лидерство", color: "bg-orange-950/50 border-orange-900" },
              { sign: "Дева", desc: "порядок, работа, детали", color: "bg-lime-950/50 border-lime-900" },
              { sign: "Весы", desc: "отношения, баланс, выбор", color: "bg-pink-950/50 border-pink-900" },
              { sign: "Скорпион", desc: "глубина, трансформация, сила", color: "bg-purple-950/50 border-purple-900" },
              { sign: "Стрелец", desc: "свобода, движение, возможности", color: "bg-indigo-950/50 border-indigo-900" },
              { sign: "Козерог", desc: "цели, дисциплина, результат", color: "bg-stone-800 border-stone-700" },
              { sign: "Водолей", desc: "идеи, технологии, нестандартность", color: "bg-cyan-950/50 border-cyan-900" },
              { sign: "Рыбы", desc: "интуиция, сны, творчество", color: "bg-fuchsia-950/50 border-fuchsia-900" }
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg border ${item.color}`}>
                <div className="font-medium text-slate-200">{item.sign}</div>
                <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 mt-6">
        <Link href="/dashboard/networks/zodiac/template-refinement" className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-5 shadow-sm hover:bg-fuchsia-500/20 transition flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="h-5 w-5 text-fuchsia-400" />
              <h3 className="text-lg font-semibold text-white">Шаблоны Зодиака</h3>
            </div>
            <div className="text-sm text-fuchsia-300">Структура постов, уникальность знаков, CTA, Mini App-связка и контроль повторяемости.</div>
          </div>
          <div className="flex items-center justify-center p-2 rounded-full bg-slate-800/50">
            <svg className="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </Link>
        <Link href="/dashboard/networks/zodiac/quality-scoring" className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5 shadow-sm hover:bg-sky-500/20 transition flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-5 w-5 text-sky-400" />
              <h3 className="text-lg font-semibold text-white">Оценка качества</h3>
            </div>
            <div className="text-sm text-sky-300">Scoring перед soft launch: структура, CTA, безопасность, повторяемость и различимость знаков.</div>
          </div>
          <div className="flex items-center justify-center p-2 rounded-full bg-slate-800/50">
            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </Link>
        <Link href="/dashboard/networks/zodiac/manual-review" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 shadow-sm hover:bg-rose-500/20 transition flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="h-5 w-5 text-rose-400" />
              <h3 className="text-lg font-semibold text-white">Ручная проверка</h3>
            </div>
            <div className="text-sm text-rose-300">Очередь OK / REVIEW / BLOCKED перед soft launch и любым live-действием.</div>
          </div>
          <div className="flex items-center justify-center p-2 rounded-full bg-slate-800/50">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </Link>
      </section>
    </div>
  );
}
