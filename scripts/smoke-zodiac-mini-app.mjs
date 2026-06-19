#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const DEFAULT_URL = "http://localhost:3000/compatibility";
const DEFAULT_TIMEOUT_MS = 120_000;
const VIEWPORT = { width: 390, height: 844 };
const VIP_ACTIVE_CARDS = [
  "Расширенная натальная карта",
  "Месячный прогноз",
  "Расширенный именной профиль",
  "Расширенная совместимость",
  "Ментальная карта пары",
  "30-дневный календарь пары",
  "Помощник сообщений",
  "Расширенная нумерология",
  "Толкование ангельских чисел",
  "Талисманы и символы силы",
  "VIP мистический день",
];
const MYSTIC_FEATURES = ["Карта", "Таро", "Руна"];
const BIRTH_MATRIX_LABELS = ["Матрица судьбы", "Матрица рождения", "Матрица"];
const PLACEHOLDER_PATTERNS = [/TODO/i, /lorem ipsum/i, /placeholder/i, /Скоро появится/i];
const RETENTION_STORAGE_KEY = "zodiac-mini-app-retention-v1";
const FORBIDDEN_RETENTION_VALUES = [
  "1998-06-15",
  "15.06.1998",
  "23:55",
  "Dnipro",
  "2000-03-21",
  "2000-12-22",
  "19.06.1992",
  "11:11",
  "Что мне выбрать?",
  "Где нужна защита?",
  "Хочу спокойствия",
  "Мне важно сказать",
  "Мне важно не победить",
  "Спасибо, что слышишь",
];

const options = parseArgs(process.argv.slice(2));
const startedProcesses = [];
let tempBrowserProfile = null;

main().catch((error) => {
  console.error(`Mini App Smoke: FAIL`);
  console.error(`Reason: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}).finally(async () => {
  await cleanup();
});

async function main() {
  const initialUrl = options.url ?? process.env.ZODIAC_MINIAPP_SMOKE_URL ?? DEFAULT_URL;
  const timeoutMs = numberOption(options.timeout, DEFAULT_TIMEOUT_MS);
  const report = createReport();

  const server = await ensureMiniAppServer(initialUrl, timeoutMs, Boolean(options.url || process.env.ZODIAC_MINIAPP_SMOKE_URL));
  report.serverUrl = server.url;
  report.startedDevServer = server.started;
  report.serverMode = server.mode || (server.started ? "unknown" : "external");

  const browserPath = findBrowserExecutable();
  if (!browserPath || typeof WebSocket !== "function") {
    printSkipped("headless browser not available", report);
    return;
  }

  let browser;
  try {
    browser = await launchBrowser(browserPath);
  } catch (error) {
    printSkipped(`headless browser not available (${error instanceof Error ? error.message : String(error)})`, report);
    return;
  }

  const page = await createPage(browser.debugPort);
  const client = await CdpClient.connect(page.webSocketDebuggerUrl);
  attachErrorCollectors(client, report);
  await enablePageDomains(client);

  const httpStatus = await probeHttpStatus(server.url);
  report.httpStatus = httpStatus;
  if (httpStatus !== 200) {
    throw new Error(`Expected HTTP 200 for ${server.url}, got ${httpStatus || "no response"}.`);
  }

  await navigate(client, server.url);
  await installSmokeHelpers(client);
  await runBrowserModeSmoke(client, report);
  await runStartParamSmoke(client, server.url, report);

  report.telegramMock = "RUNNING";
  await installTelegramMock(client);
  await navigate(client, withSmokeParam(server.url, "telegram"));
  await installSmokeHelpers(client);
  await runTelegramMockSmoke(client, report);

  await client.close();

  if (report.consoleErrors.length || report.runtimeErrors.length || report.networkErrors.length) {
    printSummary("FAIL", report);
    throw new Error(`Browser reported errors: console=${report.consoleErrors.length}, runtime=${report.runtimeErrors.length}, network=${report.networkErrors.length}.`);
  }

  report.browserMode = "PASS";
  report.telegramMock = "PASS";
  printSummary("PASS", report);
}

async function runBrowserModeSmoke(client, report) {
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Mini App main menu hero did not render.");
  const mainCategories = ["Гороскопы", "Совместимость", "Матрица судьбы", "Ангельские числа", "Нумерология", "Мистика", "Таро и руны", "Луна и ритуалы", "VIP раздел", "Мой профиль"];
  for (const category of mainCategories) {
    if (!(await hasText(client, new RegExp(category, "i")))) throw new Error(`Main menu category is missing: ${category}`);
  }
  if (await hasText(client, /Розыгрыши/i)) throw new Error("Giveaways should not be a top-level main menu category.");
  report.mainMenuCategoryCount = mainCategories.length;
  report.mainMenuChecked = true;

  await click(client, "Мой профиль");
  await waitForPageText(client, /Мой профиль|Локальные данные/, "Profile screen did not render from main menu.");
  await waitForPageText(client, /Здесь появятся последние расчёты и открытые разделы/, "History empty state did not render.");
  await waitForPageText(client, /Здесь появятся сохранённые расчёты и быстрые переходы/, "Favorites empty state did not render.");
  report.profileChecked = true;
  report.historyEmptyStateChecked = true;
  report.favoritesEmptyStateChecked = true;
  await click(client, "Очистить данные");
  await waitForPageText(client, /Здесь появятся последние расчёты и открытые разделы/, "History empty state did not remain after clearing local data.");
  report.localDataCleared = true;
  await click(client, "Главная");
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Back to main menu did not render after Profile.");

  await click(client, "Совместимость");
  await waitForPageText(client, /Любовная совместимость|Дружеская совместимость|Совместимость/, "Compatibility category did not render.");
  await click(client, "Любовная совместимость");
  await waitForPageText(client, /Выберите знак|Овен/, "Compatibility sign gate did not render.");
  await click(client, "Овен");
  await waitForPageText(client, /Совместимость|Шаг 1/, "Love flow did not render after sign selection.");
  await assertNoNativeSelects(client, report, "Compatibility step 1");
  await click(client, "Персональный");
  await fillVisibleInputAt(client, 1, "1998-06-15");
  await waitForPageText(client, /Близнецы/, "Birth date autosign failed for 1998-06-15 -> Близнецы.");
  await expectVisibleSelectValue(client, 0, "gemini", "Birth date autosign 1998-06-15 -> Близнецы");
  report.compatibilityAutosignCases.push("1998-06-15 -> Близнецы");
  await fillVisibleInputAt(client, 1, "2000-03-21");
  await waitForPageText(client, /Овен/, "Birth date autosign failed for 2000-03-21 -> Овен.");
  await expectVisibleSelectValue(client, 0, "aries", "Birth date autosign 2000-03-21 -> Овен");
  report.compatibilityAutosignCases.push("2000-03-21 -> Овен");
  await click(client, "Далее");
  await waitForPageText(client, /Партнёр|Рассчитать/, "Compatibility step 2 did not render.");
  await click(client, "Женщина");
  await selectVisibleOption(client, "Козерог");
  await fillVisibleInputAt(client, 1, "2000-12-22");
  await waitForPageText(client, /Козерог/, "Birth date autosign failed for 2000-12-22 -> Козерог.");
  await expectVisibleSelectValue(client, 0, "capricorn", "Birth date autosign 2000-12-22 -> Козерог");
  report.compatibilityAutosignCases.push("2000-12-22 -> Козерог");
  await click(client, "Рассчитать");
  await waitForPageText(client, /Карта отношений|Главный совет|Эмоции|Быт \/ ритм|Как общаться/, "Compatibility result did not render the polished relationship card.");
  await assertFinalAstroMap(client, "Compatibility relationship result", report);
  report.compatibilityResultChecked = true;
  await click(client, "Сохранить пару");
  await waitForPageText(client, /Пара сохранена/, "Compatibility save button did not show saved state.");
  report.compatibilityPairSaved = true;
  await click(client, "Поделиться");
  await settle(client);
  await waitForPageText(client, /совместимость|Mini App|копирования|скопирован/i, "Compatibility share did not render or copy safely.");
  report.compatibilityShareChecked = true;
  await click(client, "Пара");
  await waitForPageText(client, /Действие сегодня|Главный шаг|Лучший тон/, "Compatibility action today block did not render.");
  report.compatibilityActionChecked = true;
  await click(client, "Календарь пары");
  await waitForPageText(client, /30 дней пары|Тема|Энергия|Риск/, "30-day couple calendar did not render with detailed fields.");
  report.compatibilityCalendarChecked = true;
  await click(client, "Текст");
  await waitForPageText(client, /Что написать|Скопировать|Тёплый старт|Мягкий шаг/, "Relationship message helper did not render 3 message variants.");
  await click(client, "Скопировать");
  await waitForPageText(client, /Скопировано/, "Relationship message helper did not show copied state.");
  report.compatibilityMessageChecked = true;
  await click(client, "Профиль");
  await waitForPageText(client, /Избранное|История|Совместимость: Овен \+ Козерог/, "Saved compatibility pair/history did not render in Profile.");
  await click(client, "Открыть");
  await waitForPageText(client, /Овен.*Козерог|Козерог.*Овен|Карта отношений|Главный совет/, "Opening saved compatibility pair did not restore the pair.");
  report.compatibilityPairReopened = true;

  await click(client, "Главная");
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Back to main menu did not render after Compatibility.");
  await click(client, "Гороскопы");
  await waitForPageText(client, /Открыт раздел|Гороскоп недели|Удачные дни|Лунный календарь/, "Horoscopes category did not render.");
  report.horoscopesChecked = true;

  await click(client, "Главная");
  await waitForPageText(client, /Астрологический центр|Луна и ритуалы/, "Back to main menu did not render after Horoscopes.");
  await click(client, "Луна и ритуалы");
  await runLunarRitualSmoke(client, report);

  await click(client, "Главная");
  await waitForPageText(client, /Астрологический центр|Ангельские числа/, "Back to main menu did not render after Horoscopes.");
  await click(client, "Ангельские числа");
  await waitForPageText(client, /Ангельские числа|11:11|22:22/, "Angel Numbers category did not render.");
  await assertFeatureScreen(client, "Ангельские числа", { allowSoon: false, minLength: 260 });
  report.angelNumbersChecked = true;
  await click(client, "Сохранить");
  report.favoriteSaved = true;
  await click(client, "Поделиться");
  await settle(client);
  await waitForPageText(client, /Текст для копирования|Текст скопирован|Ангельские числа/, "Share fallback/copy state did not render for Angel Numbers.");
  report.shareChecked = true;
  await click(client, "Профиль");
  await waitForPageText(client, /Избранное|История|Мой профиль/, "Profile bottom nav did not render after saving Angel Numbers.");
  await waitForPageText(client, /Ангельские числа/, "Saved Angel Numbers favorite/history did not render in Profile.");
  await click(client, "Открыть");
  await waitForPageText(client, /Ангельские числа|11:11|22:22/, "Opening saved Angel Numbers favorite did not return to the feature.");
  report.favoriteOpened = true;
  await click(client, "Профиль");
  await waitForPageText(client, /Мой профиль|Локальные данные/, "Profile did not render after opening favorite.");
  await click(client, "Очистить данные");
  await waitForPageText(client, /Здесь появятся сохранённые расчёты и быстрые переходы/, "Favorites empty state did not render after clearing local data.");
  report.localDataCleared = true;

  await click(client, "Главная");
  await waitForPageText(client, /Астрологический центр|VIP раздел/, "Back to main menu did not render after Angel Numbers.");
  await click(client, "VIP раздел");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "VIP menu did not render.");
  report.freeAccessVisible = await hasText(client, /17\.09\.2026/);

  const giveawayStatus = await evalPage(client, "window.__zodiacSmoke.buttonStatus(arguments[0])", ["Розыгрыши (Скоро)"]);
  report.giveawaysLocked = Boolean(giveawayStatus.exists && giveawayStatus.disabled);
  if (!report.giveawaysLocked) throw new Error("Giveaways card must remain locked/disabled inside VIP.");

  for (const card of VIP_ACTIVE_CARDS) {
    await click(client, card);
    await settle(client);
    await runVipToolSmoke(client, card, report);
    report.vipChecked += 1;
    await clickBackIcon(client);
    await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, `Back did not return from VIP card "${card}".`);
  }
  await assertRetentionPrivacy(client, report);

  await click(client, "Главное меню");
  await waitForPageText(client, /Астрологический центр|Мистика/, "Back to main menu did not render after VIP.");
  await click(client, "Мистика");
  await waitForPageText(client, /Мистика|Ангельские числа|11:11/, "Mystic tab did not render.");
  for (const feature of MYSTIC_FEATURES) {
    await click(client, feature);
    await settle(client);
    await assertFeatureScreen(client, feature, { allowSoon: false, minLength: 260 });
    report.mysticChecked += 1;
    await click(client, "11:11");
    await waitForPageText(client, /Ангельские числа|11:11/, `Mystic default tab did not return after "${feature}".`);
  }

  await runTarotSmoke(client, report);
  await click(client, "11:11");
  await waitForPageText(client, /Ангельские числа|11:11/, "Mystic default tab did not return after Tarot richer flow.");
  await runRuneSmoke(client, report);
  await click(client, "11:11");
  await waitForPageText(client, /Ангельские числа|11:11/, "Mystic default tab did not return after Rune richer flow.");

  await openBirthMatrix(client);
  if (!(await hasText(client, /ДД\.ММ\.ГГГГ|дд\.мм\.гггг|Введите дату рождения/i))) {
    await click(client, "Изменить");
    await waitForPageText(client, /ДД\.ММ\.ГГГГ|дд\.мм\.гггг|Введите дату рождения|1998-06-15/i, "Birth Matrix edit mode did not render an input.");
  }
  await fillVisibleInput(client, "1998-06-15");
  await click(client, "Рассчитать");
  await settle(client);
  await assertFeatureScreen(client, "Матрица судьбы", { allowSoon: false, minLength: 1400 });
  await assertBirthMatrixDepth(client, report);
  await click(client, "11:11");
  await waitForPageText(client, /Ангельские числа|11:11/, "Mystic default tab did not return after Birth Matrix.");
  report.birthMatrixChecked = true;

  report.browserMode = "PASS";
}

async function runStartParamSmoke(client, baseUrl, report) {
  const cases = [
    { param: "compat", sign: "Овен", beforeSign: "Любовная совместимость", landing: /Любовная совместимость|Совместимость/, pattern: /Совместимость|Шаг 1/, message: "startapp=compat did not open Compatibility after sign selection." },
    { param: "compat_love", sign: "Овен", landing: /Любовная совместимость|Совместимость/, pattern: /Любовь|Шаг 1|Совместимость/, message: "startapp=compat_love did not open Love compatibility after sign selection." },
    { param: "compat_reconciliation", sign: "Овен", landing: /Примирение|Совместимость/, pattern: /Примирение|Шаг 1|Совместимость/, message: "startapp=compat_reconciliation did not open Reconciliation compatibility after sign selection." },
    { param: "compat_gemini", sign: "Близнецы", beforeSign: "Любовная совместимость", landing: /Любовная совместимость|Совместимость/, pattern: /Совместимость|Шаг 1/, message: "startapp=compat_gemini did not open Compatibility after sign selection." },
    { param: "mystic", sign: "Овен", landing: /Мистика|Выберите знак/, pattern: /Мистика|Ангельские числа|11:11/, message: "startapp=mystic did not open Mystic after sign selection." },
    { param: "vip", sign: "Овен", landing: /VIP раздел|Выберите знак/, pattern: /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, message: "startapp=vip did not open VIP after sign selection." },
    { param: "birth_matrix", sign: "Овен", landing: /Матрица судьбы|Выберите знак/, pattern: /Матрица|дд\.мм\.гггг|Дата/, message: "startapp=birth_matrix did not open Birth Matrix after sign selection." },
    { param: "angel_numbers", sign: "Овен", landing: /Ангельские числа|Выберите знак/, pattern: /Ангельские числа|11:11|22:22/, message: "startapp=angel_numbers did not open Angel Numbers after sign selection." },
    { param: "week", sign: "Овен", landing: /Гороскопы|Выберите знак/, pattern: /Неделя|Прогнозы|Удачные дни/, message: "startapp=week did not open weekly forecasts after sign selection." },
    { param: "profile", landing: /Мой профиль|Локальные данные/, pattern: /Мой профиль|Избранное|История/, message: "startapp=profile did not open Profile." },
    { param: "history", landing: /История|последние расчёты/, pattern: /История|Здесь появятся последние расчёты/, message: "startapp=history did not open Profile history." },
    { param: "favorites", landing: /Избранное|сохранённые расчёты/, pattern: /Избранное|Здесь появятся сохранённые расчёты/, message: "startapp=favorites did not open Profile favorites." },
  ];

  await runVipPairGateShortcutSmoke(client, baseUrl, report);
  await runNatalVipCtaSmoke(client, baseUrl, report);

  for (const item of cases) {
    await navigate(client, withStartParam(baseUrl, item.param));
    await installSmokeHelpers(client);
    await waitForPageText(client, item.landing, `startapp=${item.param} landing did not render.`);
    if (item.beforeSign) {
      await click(client, item.beforeSign);
      await waitForPageText(client, /Выберите знак|Овен|Близнецы/, `startapp=${item.param} sign gate did not render.`);
    }
    if (item.sign) await click(client, item.sign);
    await waitForPageText(client, item.pattern, item.message);
    if (item.param === "vip") {
      await click(client, "Расширенная совместимость");
      await waitForPageText(client, /Нужна пара для расчёта|Первый знак|Второй знак/, "VIP pair-gated inline picker did not render.");
      await assertNoNativeSelects(client, report, "VIP startapp pair inline picker");
      await selectVisibleOption(client, "Телец", { index: 1 });
      await click(client, "Рассчитать");
      await waitForPageText(client, /Результат VIP|VIP карта отношений/, "VIP inline pair picker did not calculate a result.");
      report.vipPairGateInlinePickerChecked = true;
    }
    report.startParamsChecked.push(item.param);
  }
}

async function runVipPairGateShortcutSmoke(client, baseUrl, report) {
  await openVipFromStartParam(client, baseUrl);
  await click(client, "Карта+");
  await waitForPageText(client, /Нужна пара для расчёта|Выберите два знака/, "Karta+ did not show a pair-required state.");
  await click(client, "Выбрать знаки здесь");
  await waitForPageText(client, /Ментальная карта пары|Первый знак|Второй знак/, "Karta+ did not open an inline VIP pair picker.");
  await assertNoNativeSelects(client, report, "Karta+ inline pair picker");
  await selectVisibleOption(client, "Телец", { index: 1 });
  await click(client, "Рассчитать");
  await waitForPageText(client, /Результат VIP|Ментальная карта связи/, "Karta+ inline pair picker did not calculate.");
  report.vipKartaPlusInlinePickerChecked = true;

  await openVipFromStartParam(client, baseUrl);
  await click(client, "30 дней");
  await waitForPageText(client, /Нужна пара для расчёта|Выберите два знака/, "30 days tab did not show a pair-required state.");
  await click(client, "Выбрать знаки здесь");
  await waitForPageText(client, /30-дневный календарь пары|Первый знак|Второй знак/, "30 days tab did not open an inline VIP pair picker.");
  await assertNoNativeSelects(client, report, "30 days inline pair picker");
  await selectVisibleOption(client, "Телец", { index: 1 });
  await click(client, "Показать");
  await waitForPageText(client, /Результат VIP|30 дней пары/, "30 days inline pair picker did not calculate.");
  report.vipThirtyDaysInlinePickerChecked = true;
}

async function runNatalVipCtaSmoke(client, baseUrl, report) {
  const cases = [
    { label: "Смотреть бесплатные расширения", expected: /Расширенная натальная карта|VIP натальная схема|Ввод для расчёта/ },
    { label: "Глубже про отношения", expected: /Расширенная совместимость|Первый знак|Второй знак/ },
    { label: "Фокус месяца", expected: /Месячный прогноз|Месяц|Фокус/ },
    { label: "Стиль лучших дней", expected: /30-дневный календарь пары|Первый знак|Второй знак/ },
  ];

  for (const item of cases) {
    await openNatalChartWithVipBlocks(client, baseUrl);
    await click(client, item.label);
    await waitForPageText(client, item.expected, `Dead CTA "${item.label}" did not open the expected VIP tool.`);
  }

  report.deadCtaChecked = true;
}

async function openVipFromStartParam(client, baseUrl) {
  await navigate(client, withStartParam(baseUrl, "vip"));
  await installSmokeHelpers(client);
  await waitForPageText(client, /VIP раздел|Выберите знак|Овен/, "VIP startapp sign gate did not render.");
  await click(client, "Овен");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "VIP startapp menu did not render.");
}

async function openNatalChartWithVipBlocks(client, baseUrl) {
  await navigate(client, withSmokeParam(baseUrl, "dead_cta"));
  await installSmokeHelpers(client);
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Mini App home did not render for dead CTA smoke.");
  await click(client, "Нумерология");
  await waitForPageText(client, /Выберите знак|Овен/, "Profile sign gate did not render for dead CTA smoke.");
  await click(client, "Овен");
  await waitForPageText(client, /Нумерология|Открыт раздел/, "Profile category did not render for dead CTA smoke.");
  await click(client, "Натал");
  await waitForPageText(client, /Натальная карта|Дата рождения/, "Natal chart feature did not render for dead CTA smoke.");
  await fillVisibleInputAt(client, 1, "19.06.1992");
  await waitForPageText(client, /VIP-разбор открыт бесплатно|Глубже про отношения|Фокус месяца|Стиль лучших дней/, "Natal VIP blocks did not render for dead CTA smoke.");
}

async function runTelegramMockSmoke(client, report) {
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Telegram mock Mini App home did not render.");
  const initialCalls = await telegramCalls(client);
  if (initialCalls.ready < 1 || initialCalls.expand < 1) {
    throw new Error(`Telegram mock expected ready/expand calls, got ready=${initialCalls.ready}, expand=${initialCalls.expand}.`);
  }

  const homeBackBeforeCategory = await telegramCalls(client);
  if (homeBackBeforeCategory.backShow > 0 && homeBackBeforeCategory.backHide < 1) {
    throw new Error("Telegram BackButton should be hidden on the main menu.");
  }

  await click(client, "VIP раздел");
  await waitForPageText(client, /VIP раздел|Выберите знак|Овен/, "Telegram mock VIP sign gate did not render.");
  await click(client, "Овен");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "Telegram mock VIP menu did not render.");
  await click(client, "Месячный прогноз");
  await settle(client);

  const afterDetailCalls = await telegramCalls(client);
  if (afterDetailCalls.backShow < 1 || afterDetailCalls.backOnClick < 1) {
    throw new Error(`Telegram BackButton did not register on a VIP detail screen: show=${afterDetailCalls.backShow}, onClick=${afterDetailCalls.backOnClick}.`);
  }
  if (afterDetailCalls.impact + afterDetailCalls.selection < 1) {
    throw new Error("Telegram haptic mock was not used during interactions.");
  }

  const backTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!backTriggered) throw new Error("Telegram BackButton mock had no active callback.");
  await waitForPageText(client, /VIP открыт бесплатно|Ранний доступ до 17\.09\.2026/, "Telegram BackButton did not return to VIP menu.");

  const categoryBackTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!categoryBackTriggered) throw new Error("Telegram BackButton mock had no category callback.");
  await waitForPageText(client, /Астрологический центр|Выберите, что хотите узнать сегодня/, "Telegram BackButton did not return from VIP category to home.");
  report.telegramCategoryBackChecked = true;

  const finalCalls = await telegramCalls(client);
  report.telegramReadyCalled = finalCalls.ready > 0;
  report.telegramExpandCalled = finalCalls.expand > 0;
  report.telegramBackButtonChecked = finalCalls.backShow > 0 && finalCalls.backHide > 0;
  report.telegramHapticsChecked = finalCalls.impact + finalCalls.selection > 0;

  await click(client, "Мистика");
  await waitForPageText(client, /Мистика|Ангельские числа|11:11/, "Telegram mock Mystic tab did not render.");
  await openBirthMatrix(client);
  await assertFeatureScreen(client, "Матрица судьбы", { allowSoon: false, minLength: 260 });
  const matrixBackTriggered = await evalPage(client, "window.__triggerTelegramBack?.()", []);
  if (!matrixBackTriggered) throw new Error("Telegram BackButton mock had no active callback for Birth Matrix.");
  await waitForPageText(client, /Ангельские числа|11:11/, "Telegram BackButton did not return from Birth Matrix to Mystic menu.");

  report.telegramMock = "PASS";
}

async function assertFeatureScreen(client, label, options = {}) {
  const snapshot = await evalPage(client, "window.__zodiacSmoke.snapshot()", []);
  const minLength = options.minLength ?? 320;
  if (snapshot.textLength < minLength) {
    throw new Error(`Feature "${label}" looks empty: text length ${snapshot.textLength}.`);
  }
  const bad = PLACEHOLDER_PATTERNS.find((pattern) => pattern.test(snapshot.text));
  if (bad && !options.allowSoon) {
    throw new Error(`Feature "${label}" contains placeholder text matching ${bad}.`);
  }
}

async function runTarotSmoke(client, report) {
  await click(client, "Таро");
  await settle(client);
  await waitForPageText(client, /Таро|Сформулируйте вопрос|Тип расклада/, "Tarot flow did not render inputs.");
  await click(client, "Решение");
  await click(client, "3 карты");
  await fillVisibleTextarea(client, "Что мне выбрать?");
  await click(client, "Рассчитать расклад");
  await waitForPageText(client, /Краткий ответ|Действие сегодня|Карты расклада/, "Tarot spread did not render structured result.");
  const visualCount = await evalPage(client, "document.querySelectorAll('[data-tarot-spread-visual=\"true\"]').length", []);
  const cardCount = await evalPage(client, "document.querySelectorAll('[data-tarot-card]').length", []);
  const positionCount = await evalPage(client, "document.querySelectorAll('[data-tarot-position]').length", []);
  if (visualCount < 1) throw new Error("Tarot spread visual did not render.");
  if (cardCount < 3) throw new Error(`Tarot spread expected 3 cards, got ${cardCount}.`);
  if (positionCount < 3) throw new Error(`Tarot spread expected 3 positions, got ${positionCount}.`);
  await click(client, "Сохранить расклад");
  await waitForPageText(client, /Сохранено/, "Tarot save did not show saved state.");
  await click(client, "Поделиться", { index: 1 });
  await waitForPageText(client, /Ссылка готова|Готово к отправке|Скопировано|Текст для копирования|Текст скопирован|Откройте Telegram/i, "Tarot share did not show safe share state.");
  await assertRetentionPrivacy(client, report);
  report.tarotFlowChecked = true;
  report.tarotCardsChecked = cardCount;
}

async function runRuneSmoke(client, report) {
  await click(client, "Руна");
  await settle(client);
  await waitForPageText(client, /Руны|Режим|Вопрос к рунам/, "Rune flow did not render inputs.");
  await click(client, "Три руны");
  await fillVisibleTextarea(client, "Где нужна защита?");
  await click(client, "Рассчитать руны");
  await waitForPageText(client, /Главная руна|Сила|Риск|Действие сегодня|Талисман/, "Rune spread did not render structured result.");
  const visualCount = await evalPage(client, "document.querySelectorAll('[data-rune-spread-visual=\"true\"]').length", []);
  const runeCount = await evalPage(client, "document.querySelectorAll('[data-rune-card]').length", []);
  if (visualCount < 1) throw new Error("Rune spread visual did not render.");
  if (runeCount < 3) throw new Error(`Rune spread expected 3 runes, got ${runeCount}.`);
  await click(client, "Сохранить расклад");
  await waitForPageText(client, /Сохранено/, "Rune save did not show saved state.");
  await click(client, "Поделиться", { index: 1 });
  await waitForPageText(client, /Ссылка готова|Готово к отправке|Скопировано|Текст для копирования|Текст скопирован|Откройте Telegram/i, "Rune share did not show safe share state.");
  await assertRetentionPrivacy(client, report);
  report.runeFlowChecked = true;
  report.runesChecked = runeCount;
}

async function runLunarRitualSmoke(client, report) {
  await waitForPageText(client, /Лунный ритуал|символический лунный ритм|Режим/, "Lunar/Ritual section did not render.");
  await click(client, "Ритуал дня");
  await click(client, "Сегодня");
  await fillVisibleTextarea(client, "Хочу спокойствия");
  await click(client, "Показать");
  await settle(client);
  await waitForPageText(client, /Лунный ритуал|символический лунный календарь|14 дней ритма/, "Lunar ritual result did not render the hero/calendar.");
  await waitForPageText(client, /Энергия дня|Что делать|Что не делать|Ритуал|Чек-лист|Вечерний итог/, "Lunar ritual result did not render all structured sections.");
  const visualCount = await evalPage(client, "document.querySelectorAll('[data-lunar-calendar-visual=\"true\"]').length", []);
  const selectedDayCount = await evalPage(client, "document.querySelectorAll('[data-lunar-selected=\"true\"]').length", []);
  const legendCount = await evalPage(client, "document.querySelectorAll('[data-lunar-calendar-legend=\"true\"]').length", []);
  const gridDayCount = await evalPage(client, "document.querySelectorAll('[data-lunar-calendar-day]').length", []);
  if (visualCount < 1) throw new Error("Lunar ritual did not render LunarCalendarVisual.");
  if (selectedDayCount < 1) throw new Error("Lunar calendar did not mark a selected day.");
  if (legendCount < 1) throw new Error("Lunar calendar did not render a legend.");
  if (gridDayCount < 14) throw new Error(`Lunar calendar expected 14 days, got ${gridDayCount}.`);
  await click(client, "Сохранить ритуал");
  await waitForPageText(client, /Сохранено/, "Lunar ritual save did not show saved state.");
  await click(client, "Поделиться");
  await waitForPageText(client, /Ссылка готова|Готово к отправке|Скопировано|Текст для копирования|Текст скопирован|Откройте Telegram/i, "Lunar ritual share did not show safe share state.");
  await assertRetentionPrivacy(client, report);
  report.lunarRitualChecked = true;
  report.lunarCalendarVisualChecked = true;
  report.lunarCalendarLegendChecked = true;
}

async function runVipToolSmoke(client, label, report) {
  await assertFeatureScreen(client, label, { allowSoon: false, minLength: 420 });
  await waitForPageText(client, /Ввод для расчёта/, `VIP tool "${label}" did not render an input block.`);
  await assertNoNativeSelects(client, report, `VIP tool "${label}"`);
  if (label === "Расширенная натальная карта") {
    await fillVisibleInputAt(client, 0, "1998-06-15");
    await fillVisibleInputAt(client, 1, "23:55");
    await fillVisibleInputAt(client, 2, "Dnipro");
    await waitForPageText(client, /Близнецы|Карта по дате рождения и знаку/, "VIP Natal date input did not auto-detect Близнецы.");
    await expectVisibleSelectValue(client, 0, "gemini", "VIP Natal birth date autosign 1998-06-15 -> Близнецы");
    report.vipNatalAutosignChecked = true;
  }
  await clickAny(client, ["Рассчитать", "Показать"]);
  await waitForPageText(client, /Результат VIP/, `VIP tool "${label}" did not render a result block after calculation.`);
  await assertFeatureScreen(client, label, { allowSoon: false, minLength: 700 });
  if (["Расширенная натальная карта", "Расширенная совместимость", "Ментальная карта пары", "Расширенная нумерология", "VIP мистический день"].includes(label)) {
    await assertChartVisual(client, label, report);
  }
  if (label === "Расширенная натальная карта") {
    await assertPremiumNatalChart(client, report);
  }
  report.vipCalculated += 1;

  await clickAny(client, ["Сохранить карту", "Сохранить результат"]);
  await waitForPageText(client, /Сохранено/, `VIP tool "${label}" did not show saved state.`);
  report.vipSaved += 1;

  await clickAny(client, ["Поделиться картой", "Поделиться результатом"]);
  await waitForPageText(client, /Готово к отправке|Ссылка готова|Скопировано|Откройте Telegram|Не удалось открыть отправку|Текст для копирования|Текст скопирован/i, `VIP tool "${label}" did not show share state or safe share fallback.`);
  report.vipShared += 1;

  if (label === "Помощник сообщений") {
    await click(client, "Скопировать");
    await waitForPageText(client, /Скопировано/, "VIP message helper did not show copied state.");
    report.vipMessageCopyChecked = true;
  }
}

async function assertRetentionPrivacy(client, report) {
  const retentionText = await evalPage(client, "window.localStorage.getItem(arguments[0]) || ''", [RETENTION_STORAGE_KEY]);
  if (!retentionText) {
    report.localStoragePrivacyChecked = true;
    return;
  }

  for (const forbiddenValue of FORBIDDEN_RETENTION_VALUES) {
    if (retentionText.includes(forbiddenValue)) {
      throw new Error(`Retention localStorage contains forbidden raw value: ${forbiddenValue}`);
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(retentionText);
  } catch {
    throw new Error("Retention localStorage is not valid JSON.");
  }
  const serialized = JSON.stringify(parsed);
  for (const forbiddenField of ["birthDate", "birthTime", "birthCity", "city", "cityQuery", "selectedCityId", "messageText", "rawInput", "rawResult", "resultText"]) {
    if (serialized.includes(`"${forbiddenField}"`)) {
      throw new Error(`Retention localStorage contains forbidden field: ${forbiddenField}`);
    }
  }
  report.localStoragePrivacyChecked = true;
}

async function ensureMiniAppServer(rawUrl, timeoutMs, urlProvided) {
  const normalized = new URL(rawUrl);
  const firstProbe = await probeHttpStatus(normalized.href);
  if (firstProbe === 200) {
    return { url: normalized.href, started: false };
  }
  if (urlProvided) {
    throw new Error(`Provided URL is not ready: ${normalized.href} returned ${firstProbe || "no response"}.`);
  }

  const requestedPort = Number(normalized.port || (normalized.protocol === "https:" ? 443 : 80));
  const host = normalized.hostname === "localhost" ? "127.0.0.1" : normalized.hostname;
  const port = await isPortFree(requestedPort) ? requestedPort : await findFreePort(3100);
  const smokeUrl = new URL(normalized.href);
  smokeUrl.hostname = "127.0.0.1";
  smokeUrl.port = String(port);

  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextCli)) throw new Error(`Next CLI was not found at ${nextCli}. Run npm install before smoke.`);

  const hasProductionBuild = fs.existsSync(path.join(process.cwd(), ".next", "BUILD_ID"));
  const serverMode = hasProductionBuild ? "start" : "dev";
  const serverArgs = hasProductionBuild
    ? [nextCli, "start", "-H", host, "-p", String(port)]
    : [nextCli, "dev", "-H", host, "-p", String(port)];

  const child = spawn(process.execPath, serverArgs, {
    cwd: process.cwd(),
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  startedProcesses.push(child);

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(`Next ${serverMode} server exited early.\n${output}`);
    return (await probeHttpStatus(smokeUrl.href)) === 200;
  }, `Next ${serverMode} server did not become ready at ${smokeUrl.href}.\n${output}`, timeoutMs, 1000);

  return { url: smokeUrl.href, started: true, mode: serverMode };
}

async function launchBrowser(browserPath) {
  const debugPort = await findFreePort(9222);
  tempBrowserProfile = fs.mkdtempSync(path.join(os.tmpdir(), "zodiac-miniapp-smoke-"));
  const child = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tempBrowserProfile}`,
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    "--disable-background-networking",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-sync",
    "--no-default-browser-check",
    "--no-first-run",
    "--no-sandbox",
    "about:blank",
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  startedProcesses.push(child);

  let output = "";
  child.stdout?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });
  child.stderr?.on("data", (chunk) => {
    output += chunk.toString();
    output = output.slice(-4000);
  });

  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(output || "browser exited before CDP was ready");
    return Boolean(await fetchJson(`http://127.0.0.1:${debugPort}/json/version`).catch(() => null));
  }, `Chrome/Edge CDP did not start.\n${output}`, 20_000, 300);

  return { child, debugPort };
}

async function createPage(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create browser tab: HTTP ${response.status}.`);
  const page = await response.json();
  if (!page.webSocketDebuggerUrl) throw new Error("Browser tab did not expose a CDP WebSocket URL.");
  return page;
}

async function enablePageDomains(client) {
  await client.call("Page.enable");
  await client.call("Runtime.enable");
  await client.call("Network.enable");
  await client.call("Log.enable");
}

function attachErrorCollectors(client, report) {
  const requestUrls = new Map();
  client.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error" || event.type === "assert") {
      report.consoleErrors.push(formatConsoleArgs(event.args));
    }
  });
  client.on("Runtime.exceptionThrown", (event) => {
    report.runtimeErrors.push(event.exceptionDetails?.text || event.exceptionDetails?.exception?.description || "Runtime exception");
  });
  client.on("Log.entryAdded", (event) => {
    if (event.entry?.level === "error") report.consoleErrors.push(event.entry.text || "Log error");
  });
  client.on("Network.requestWillBeSent", (event) => {
    requestUrls.set(event.requestId, event.request?.url);
  });
  client.on("Network.responseReceived", (event) => {
    const status = event.response?.status;
    const url = event.response?.url || requestUrls.get(event.requestId) || "";
    if (status >= 400 && !isIgnorableNetworkUrl(url)) {
      report.networkErrors.push(`${status} ${url}`);
    }
  });
  client.on("Network.loadingFailed", (event) => {
    const url = requestUrls.get(event.requestId) || "";
    if (event.canceled || isIgnorableNetworkUrl(url)) return;
    report.networkErrors.push(`${event.errorText || "network_failed"} ${url}`.trim());
  });
}

async function navigate(client, url) {
  await client.call("Page.navigate", { url });
  await Promise.race([
    onceEvent(client, "Page.loadEventFired"),
    sleep(15_000),
  ]);
  await waitForPageReady(client);
}

async function waitForPageReady(client) {
  await waitFor(async () => {
    const state = await evalPage(client, "document.readyState", []);
    return state === "complete" || state === "interactive";
  }, "Page did not become interactive.", 20_000, 250);
  await settle(client);
}

async function installSmokeHelpers(client) {
  await evalPage(client, `(() => {
    function normalize(value) {
      return String(value || "").replace(/\\s+/g, " ").trim().toLowerCase();
    }
    function isVisible(element) {
      if (!element) return false;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }
    function labelOf(element) {
      return [
        element.innerText,
        element.textContent,
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
      ].filter(Boolean).join(" ");
    }
    function buttonLike() {
      return Array.from(document.querySelectorAll("button, a, [role='button']")).filter(isVisible);
    }
    function customSelects() {
      return Array.from(document.querySelectorAll("[data-zodiac-select]")).filter(isVisible);
    }
    function nativeSelects() {
      return Array.from(document.querySelectorAll("select")).filter(isVisible).filter((element) => !element.disabled);
    }
    function candidates(needle, options = {}) {
      const normalizedNeedle = normalize(needle);
      return buttonLike()
        .map((element) => ({
          element,
          text: labelOf(element),
          visibleText: element.innerText || element.textContent || element.getAttribute("aria-label") || "",
          aria: element.getAttribute("aria-label") || "",
          disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
        }))
        .filter((item) => {
          const haystack = normalize(options.ariaOnly ? item.aria : item.text);
          return options.exact ? haystack === normalizedNeedle : haystack.includes(normalizedNeedle);
        })
        .sort((a, b) => {
          const aExactAria = normalize(a.aria) === normalizedNeedle ? 0 : 1;
          const bExactAria = normalize(b.aria) === normalizedNeedle ? 0 : 1;
          if (aExactAria !== bExactAria) return aExactAria - bExactAria;
          return a.text.length - b.text.length;
        });
    }
    window.__zodiacSmoke = {
      snapshot() {
        const text = document.body?.innerText || "";
        return {
          title: document.title,
          text,
          textLength: text.trim().length,
          activeText: document.querySelector("[aria-current='page']")?.innerText || "",
          nativeSelectCount: nativeSelects().length,
          customSelectCount: customSelects().length,
          buttons: buttonLike().map((element) => ({
            text: (element.innerText || element.textContent || element.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim(),
            aria: element.getAttribute("aria-label") || "",
            disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
          })).slice(0, 80),
        };
      },
      nativeSelectCount() {
        return nativeSelects().length;
      },
      chartVisualCount() {
        return Array.from(document.querySelectorAll("[data-zodiac-chart-visual]")).filter(isVisible).length;
      },
      finalAstroMapCount() {
        return Array.from(document.querySelectorAll("[data-final-astro-map]")).filter(isVisible).length;
      },
      finalAstroLineCount() {
        return Array.from(document.querySelectorAll("[data-final-astro-map]"))
          .filter(isVisible)
          .reduce((sum, map) => sum + map.querySelectorAll("[data-final-astro-line]").length, 0);
      },
      finalAstroArrowCount() {
        return Array.from(document.querySelectorAll("[data-final-astro-map]"))
          .filter(isVisible)
          .reduce((sum, map) => sum + map.querySelectorAll("[data-final-astro-arrow]").length, 0);
      },
      finalAstroLegendCount() {
        return Array.from(document.querySelectorAll("[data-final-astro-legend]")).filter(isVisible).length;
      },
      premiumNatalChartCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-chart]")).filter(isVisible).length;
      },
      premiumNatalHeroCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-hero]")).filter(isVisible).length;
      },
      premiumNatalHonestyBadgeCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-honesty-badge]")).filter(isVisible).length;
      },
      premiumNatalTabCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-tab]")).filter(isVisible).length;
      },
      premiumNatalSectionCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-section]")).filter(isVisible).length;
      },
      premiumNatalBottomActionsCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-bottom-actions]")).filter(isVisible).length;
      },
      clickPremiumNatalTab(tabId) {
        const safeTabId = String(tabId || "").replace(/"/g, "");
        const button = document.querySelector('[data-premium-natal-tab="' + safeTabId + '"]');
        if (!button || !isVisible(button)) return { ok: false, error: "not_found" };
        button.scrollIntoView({ block: "center", inline: "center" });
        button.click();
        return { ok: true, text: button.innerText || button.textContent || "" };
      },
      clickBirthMatrixTab(tabId) {
        const safeTabId = String(tabId || "").replace(/"/g, "");
        const button = document.querySelector('[data-birth-matrix-tab="' + safeTabId + '"]');
        if (!button || !isVisible(button)) return { ok: false, error: "not_found" };
        button.scrollIntoView({ block: "center", inline: "center" });
        button.click();
        return { ok: true, text: button.innerText || button.textContent || "" };
      },
      natalAspectLineCount() {
        return Array.from(document.querySelectorAll("[data-premium-natal-chart]"))
          .filter(isVisible)
          .reduce((sum, map) => sum + map.querySelectorAll("[data-natal-aspect-line]").length, 0);
      },
      natalLegendCount() {
        return Array.from(document.querySelectorAll("[data-natal-chart-legend]")).filter(isVisible).length;
      },
      hasText(patternSource) {
        return new RegExp(patternSource, "i").test(document.body?.innerText || "");
      },
      click(needle, options = {}) {
        const index = options.index || 0;
        const found = candidates(needle, options);
        const item = found[index];
        if (!item) return { ok: false, error: "not_found", count: found.length };
        if (item.disabled && !options.allowDisabled) return { ok: false, error: "disabled", text: item.visibleText };
        item.element.scrollIntoView({ block: "center", inline: "center" });
        item.element.click();
        return { ok: true, text: item.visibleText, aria: item.aria, disabled: item.disabled, count: found.length };
      },
      clickHub(label) {
        return this.click(label, { exact: true, ariaOnly: true });
      },
      buttonStatus(needle) {
        const found = candidates(needle, {});
        const item = found[0];
        return item ? { exists: true, disabled: item.disabled, text: item.visibleText, count: found.length } : { exists: false, disabled: false, text: "", count: 0 };
      },
      clickBackIcon() {
        const found = buttonLike()
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const text = normalize(element.innerText || element.textContent || element.getAttribute("aria-label") || "");
            return text.length <= 2 && element.querySelector("svg") && rect.width <= 70 && rect.height <= 70;
          })
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        const button = found[0];
        if (!button) return { ok: false, error: "not_found" };
        button.scrollIntoView({ block: "center", inline: "center" });
        button.click();
        return { ok: true };
      },
      fillVisibleInput(value) {
        const inputs = Array.from(document.querySelectorAll("input")).filter(isVisible);
        const input = inputs.find((element) => !element.disabled && !element.readOnly);
        if (!input) return { ok: false, error: "not_found" };
        input.scrollIntoView({ block: "center", inline: "center" });
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, value);
        else input.value = value;
        input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true };
      },
      fillVisibleInputAt(index, value) {
        const inputs = Array.from(document.querySelectorAll("input")).filter(isVisible).filter((element) => !element.disabled && !element.readOnly);
        const input = inputs[index || 0];
        if (!input) return { ok: false, error: "not_found", count: inputs.length };
        input.scrollIntoView({ block: "center", inline: "center" });
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, value);
        else input.value = value;
        input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true, count: inputs.length };
      },
      fillVisibleTextarea(value) {
        const textareas = Array.from(document.querySelectorAll("textarea")).filter(isVisible).filter((element) => !element.disabled && !element.readOnly);
        const textarea = textareas[0];
        if (!textarea) return { ok: false, error: "not_found", count: textareas.length };
        textarea.scrollIntoView({ block: "center", inline: "center" });
        textarea.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        if (setter) setter.call(textarea, value);
        else textarea.value = value;
        textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true, count: textareas.length };
      },
      async selectVisibleOption(valueOrText, options = {}) {
        const selects = nativeSelects();
        const select = selects[options.index || 0];
        const normalizedNeedle = normalize(valueOrText);
        if (!select) {
          const custom = customSelects()[options.index || 0];
          if (!custom) return { ok: false, error: "not_found", count: 0, customCount: customSelects().length };
          const trigger = custom.querySelector("button[aria-haspopup='listbox']");
          if (!trigger) return { ok: false, error: "custom_trigger_not_found", count: 0, customCount: customSelects().length };
          trigger.scrollIntoView({ block: "center", inline: "center" });
          trigger.click();
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const optionsList = Array.from(document.querySelectorAll("[data-zodiac-select-option-value]")).filter(isVisible);
          const option = optionsList.find((item) => normalize(item.getAttribute("data-zodiac-select-option-value")) === normalizedNeedle || normalize(item.textContent).includes(normalizedNeedle));
          if (!option) return { ok: false, error: "custom_option_not_found", count: 0, customCount: customSelects().length, options: optionsList.map((item) => item.textContent || item.getAttribute("data-zodiac-select-option-value")).slice(0, 20) };
          option.click();
          return { ok: true, value: option.getAttribute("data-zodiac-select-option-value"), text: option.textContent, count: 0, customCount: customSelects().length };
        }
        const option = Array.from(select.options).find((item) => normalize(item.value) === normalizedNeedle || normalize(item.textContent).includes(normalizedNeedle));
        if (!option) return { ok: false, error: "option_not_found", count: selects.length, options: Array.from(select.options).map((item) => item.textContent || item.value).slice(0, 20) };
        select.scrollIntoView({ block: "center", inline: "center" });
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
        if (setter) setter.call(select, option.value);
        else select.value = option.value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return { ok: true, value: option.value, text: option.textContent, count: selects.length };
      },
      visibleSelectValue(index = 0) {
        const selects = nativeSelects();
        const select = selects[index || 0];
        if (!select) {
          const custom = customSelects()[index || 0];
          if (!custom) return { ok: false, error: "not_found", count: 0, customCount: customSelects().length };
          return { ok: true, value: custom.getAttribute("data-zodiac-select-value") || "", text: custom.innerText || custom.textContent || "", count: 0, customCount: customSelects().length };
        }
        const option = select.options[select.selectedIndex];
        return { ok: true, value: select.value, text: option?.textContent || "", count: selects.length };
      },
    };
    return true;
  })()`, []);
}

async function installTelegramMock(client) {
  await client.call("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      const calls = {
        ready: 0,
        expand: 0,
        backShow: 0,
        backHide: 0,
        backOnClick: 0,
        backOffClick: 0,
        impact: 0,
        selection: 0,
        openTelegramLink: 0,
        callbacks: [],
      };
      window.__telegramMockCalls = calls;
      window.__triggerTelegramBack = () => {
        const callback = calls.callbacks[calls.callbacks.length - 1];
        if (!callback) return false;
        callback();
        return true;
      };
      window.Telegram = {
        WebApp: {
          ready() { calls.ready += 1; },
          expand() { calls.expand += 1; this.isExpanded = true; },
          openTelegramLink(url) { calls.openTelegramLink += 1; calls.lastTelegramLink = url; },
          BackButton: {
            show() { calls.backShow += 1; },
            hide() { calls.backHide += 1; },
            onClick(callback) {
              calls.backOnClick += 1;
              calls.callbacks.push(callback);
            },
            offClick(callback) {
              calls.backOffClick += 1;
              calls.callbacks = calls.callbacks.filter((item) => item !== callback);
            },
          },
          HapticFeedback: {
            impactOccurred(style) {
              calls.impact += 1;
              calls.lastImpact = style;
            },
            selectionChanged() { calls.selection += 1; },
          },
          themeParams: {
            bg_color: "#10121f",
            text_color: "#f8fafc",
            button_color: "#c084fc",
            button_text_color: "#ffffff",
            secondary_bg_color: "#17192a",
          },
          colorScheme: "dark",
          viewportHeight: ${VIEWPORT.height},
          viewportStableHeight: ${VIEWPORT.height},
          isExpanded: false,
          platform: "ios",
          onEvent() {},
          offEvent() {},
        },
      };
    })();`,
  });
}

async function click(client, label, options = {}) {
  const result = await evalPage(client, "window.__zodiacSmoke.click(arguments[0], arguments[1])", [label, options]);
  if (!result.ok) {
    const snapshot = await evalPage(client, "window.__zodiacSmoke.snapshot()", []);
    throw new Error(`Could not click "${label}": ${result.error}. Visible buttons: ${snapshot.buttons.map((item) => item.text || item.aria).filter(Boolean).slice(0, 20).join(" | ")}`);
  }
  await settle(client);
  return result;
}

async function clickAny(client, labels, options = {}) {
  let lastError;
  for (const label of labels) {
    try {
      return await click(client, label, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Could not click any of: ${labels.join(", ")}`);
}

async function openBirthMatrix(client) {
  await clickAny(client, BIRTH_MATRIX_LABELS);
  await settle(client);
  await waitForPageText(client, /Матрица|дд\.мм\.гггг|Дата/, "Birth Matrix screen did not render.");
}

async function fillVisibleInput(client, value) {
  const result = await evalPage(client, "window.__zodiacSmoke.fillVisibleInput(arguments[0])", [value]);
  if (!result.ok) throw new Error(`Could not fill visible input: ${result.error}.`);
  await settle(client);
}

async function fillVisibleInputAt(client, index, value) {
  const result = await evalPage(client, "window.__zodiacSmoke.fillVisibleInputAt(arguments[0], arguments[1])", [index, value]);
  if (!result.ok) throw new Error(`Could not fill visible input at index ${index}: ${result.error}; visible inputs=${result.count}.`);
  await settle(client);
}

async function fillVisibleTextarea(client, value) {
  const result = await evalPage(client, "window.__zodiacSmoke.fillVisibleTextarea(arguments[0])", [value]);
  if (!result.ok) throw new Error(`Could not fill visible textarea: ${result.error}; visible textareas=${result.count}.`);
  await settle(client);
}

async function selectVisibleOption(client, valueOrText, options = {}) {
  const result = await evalPage(client, "window.__zodiacSmoke.selectVisibleOption(arguments[0], arguments[1])", [valueOrText, options]);
  if (!result.ok) throw new Error(`Could not select visible option "${valueOrText}": ${result.error}; visible selects=${result.count}; options=${(result.options || []).join(" | ")}.`);
  await settle(client);
  return result;
}

async function expectVisibleSelectValue(client, index, expectedValue, label) {
  const result = await evalPage(client, "window.__zodiacSmoke.visibleSelectValue(arguments[0])", [index]);
  if (!result.ok) throw new Error(`Could not read visible select at index ${index}: ${result.error}; visible selects=${result.count}.`);
  if (result.value !== expectedValue) throw new Error(`${label}: expected select value ${expectedValue}, got ${result.value || "empty"} (${result.text || "no text"}).`);
}

async function assertNoNativeSelects(client, report, label) {
  const count = await evalPage(client, "window.__zodiacSmoke.nativeSelectCount()", []);
  report.nativeSelectsVisible = Math.max(report.nativeSelectsVisible, count || 0);
  if (count > 0) throw new Error(`${label}: expected custom ZodiacSelect controls, found ${count} visible native <select> control(s).`);
  report.customSelectChecked = true;
}

async function assertChartVisual(client, label, report) {
  const count = await evalPage(client, "window.__zodiacSmoke.chartVisualCount()", []);
  if (count < 1) throw new Error(`VIP tool "${label}" did not render an AstroChartVisual.`);
  await assertFinalAstroMap(client, label, report);
  report.vipChartVisualsChecked += 1;
}

async function assertFinalAstroMap(client, label, report) {
  const mapCount = await evalPage(client, "window.__zodiacSmoke.finalAstroMapCount()", []);
  const lineCount = await evalPage(client, "window.__zodiacSmoke.finalAstroLineCount()", []);
  const arrowCount = await evalPage(client, "window.__zodiacSmoke.finalAstroArrowCount()", []);
  const legendCount = await evalPage(client, "window.__zodiacSmoke.finalAstroLegendCount()", []);
  if (mapCount < 1) throw new Error(`"${label}" did not render FinalAstroMap.`);
  if (lineCount < 5) throw new Error(`"${label}" FinalAstroMap expected at least 5 energy lines, got ${lineCount}.`);
  if (arrowCount < 5) throw new Error(`"${label}" FinalAstroMap expected at least 5 arrows, got ${arrowCount}.`);
  if (legendCount < 1) throw new Error(`"${label}" FinalAstroMap legend did not render.`);
  report.finalAstroMapsChecked += 1;
  report.finalAstroLinesChecked = Math.max(report.finalAstroLinesChecked, lineCount);
  report.finalAstroArrowsChecked = Math.max(report.finalAstroArrowsChecked, arrowCount);
  report.finalAstroLegendChecked = true;
}

async function assertPremiumNatalChart(client, report) {
  const mapCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalChartCount()", []);
  const heroCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalHeroCount()", []);
  const honestyBadgeCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalHonestyBadgeCount()", []);
  const tabCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalTabCount()", []);
  const sectionCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalSectionCount()", []);
  const bottomActionsCount = await evalPage(client, "window.__zodiacSmoke.premiumNatalBottomActionsCount()", []);
  const aspectLineCount = await evalPage(client, "window.__zodiacSmoke.natalAspectLineCount()", []);
  const legendCount = await evalPage(client, "window.__zodiacSmoke.natalLegendCount()", []);
  if (heroCount < 1) throw new Error("VIP Natal did not render the structured hero summary.");
  if (mapCount < 1) throw new Error("VIP Natal did not render Premium Natal Chart visual.");
  if (honestyBadgeCount < 1) throw new Error("VIP Natal did not render the honesty badge.");
  if (tabCount < 6) throw new Error(`VIP Natal expected 6 structured tabs, got ${tabCount}.`);
  if (sectionCount < 1) throw new Error("VIP Natal did not render an active structured section.");
  if (bottomActionsCount < 1) throw new Error("VIP Natal did not render the bottom action bar.");
  if (aspectLineCount < 5) throw new Error(`VIP Natal expected at least 5 symbolic aspect lines, got ${aspectLineCount}.`);
  if (legendCount < 1) throw new Error("VIP Natal legend did not render.");
  await waitForPageText(client, /Символическая натальная карта|Символическая карта|без точных домов и асцендента/i, "VIP Natal did not show symbolic/honesty wording.");
  const tabChecks = [
    { id: "main", label: "Главное", pattern: /Главный код личности|Стихия и темперамент/ },
    { id: "character", label: "Характер", pattern: /Сильные стороны|Внутренний конфликт|Как человек принимает решения/ },
    { id: "relationships", label: "Отношения", pattern: /Отношения и близость/ },
    { id: "money", label: "Деньги", pattern: /Работа \/ деньги \/ реализация/ },
    { id: "growth", label: "Рост", pattern: /Энергия месяца|Зона роста|3 персональные рекомендации/ },
    { id: "today", label: "Сегодня", pattern: /Что делать сегодня|Точность и честность/ },
  ];
  for (const item of tabChecks) {
    const clickResult = await evalPage(client, "window.__zodiacSmoke.clickPremiumNatalTab(arguments[0])", [item.id]);
    if (!clickResult.ok) throw new Error(`VIP Natal tab "${item.label}" could not be clicked: ${clickResult.error}.`);
    await settle(client);
    await waitForPageText(client, item.pattern, `VIP Natal tab "${item.label}" did not render its structured content.`);
  }
  report.vipNatalPremiumChartChecked = true;
}

async function assertBirthMatrixDepth(client, report) {
  const visualCount = await evalPage(client, "document.querySelectorAll('[data-birth-matrix-visual=\"true\"]').length", []);
  const legendCount = await evalPage(client, "document.querySelectorAll('[data-birth-matrix-legend=\"true\"]').length", []);
  const tabCount = await evalPage(client, "document.querySelectorAll('[data-birth-matrix-tab]').length", []);
  const sectionCount = await evalPage(client, "document.querySelectorAll('[data-birth-matrix-section=\"true\"]').length", []);
  if (visualCount < 1) throw new Error("Birth Matrix did not render the visual matrix block.");
  if (legendCount < 1) throw new Error("Birth Matrix did not render a visual legend.");
  if (tabCount < 6) throw new Error(`Birth Matrix expected 6 sections/tabs, got ${tabCount}.`);
  if (sectionCount < 1) throw new Error("Birth Matrix did not render the active section card.");
  await waitForPageText(client, /символическая интерпретация по дате рождения/i, "Birth Matrix did not show the honesty badge.");
  await waitForPageText(client, /Центр|Число пути|код 3|Творец/i, "Birth Matrix did not show central number/result summary.");
  const tabChecks = [
    { id: "main", label: "Главное", pattern: /Главный код|Центр матрицы/ },
    { id: "character", label: "Характер", pattern: /Характер|Внутренний конфликт|Как проявляется/ },
    { id: "relationships", label: "Отношения", pattern: /Отношения|Как строится близость/ },
    { id: "money", label: "Деньги", pattern: /Деньги и реализация|результат/ },
    { id: "lesson", label: "Урок", pattern: /Жизненный урок|Без фатализма/ },
    { id: "today", label: "Сегодня", pattern: /Что делать сегодня|Маленькое действие/ },
  ];
  for (const item of tabChecks) {
    const clicked = await evalPage(client, "window.__zodiacSmoke.clickBirthMatrixTab(arguments[0])", [item.id]);
    if (!clicked.ok) throw new Error(`Birth Matrix tab "${item.label}" could not be clicked: ${clicked.error}.`);
    await settle(client);
    await waitForPageText(client, item.pattern, `Birth Matrix tab "${item.label}" did not render expected content.`);
  }
  await click(client, "Сохранить матрицу");
  await waitForPageText(client, /Сохранено/, "Birth Matrix save did not show saved state.");
  await click(client, "Поделиться");
  await waitForPageText(client, /Ссылка готова|Готово к отправке|Скопировано|Текст для копирования|Текст скопирован|Откройте Telegram/i, "Birth Matrix share did not show safe share state.");
  await assertRetentionPrivacy(client, report);
  report.birthMatrixDepthChecked = true;
}

async function clickHub(client, label) {
  const result = await evalPage(client, "window.__zodiacSmoke.clickHub(arguments[0])", [label]);
  if (!result.ok) throw new Error(`Could not click hub tab "${label}": ${result.error}.`);
  await settle(client);
  return result;
}

async function clickBackIcon(client) {
  const result = await evalPage(client, "window.__zodiacSmoke.clickBackIcon()", []);
  if (!result.ok) throw new Error(`Could not click icon back button: ${result.error}.`);
  await settle(client);
}

async function hasText(client, pattern) {
  return evalPage(client, "window.__zodiacSmoke.hasText(arguments[0])", [pattern.source]);
}

async function waitForPageText(client, pattern, message) {
  await waitFor(() => hasText(client, pattern), message, 15_000, 250);
}

async function telegramCalls(client) {
  return evalPage(client, "window.__telegramMockCalls", []);
}

async function evalPage(client, expression, args = []) {
  const source = args.length
    ? `(function() { return ${expression}; }).apply(null, ${JSON.stringify(args)})`
    : expression;
  const response = await client.call("Runtime.evaluate", {
    expression: source,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (response.exceptionDetails) {
    const details = response.exceptionDetails;
    throw new Error(details.exception?.description || details.text || "Runtime.evaluate failed.");
  }
  return response.result?.value;
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    const client = new CdpClient(ws);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP WebSocket open timeout.")), 10_000);
      ws.addEventListener("open", () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      ws.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error("CDP WebSocket error."));
      }, { once: true });
    });
    ws.addEventListener("message", (event) => client.handleMessage(event.data));
    return client;
  }

  call(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  on(method, handler) {
    const handlers = this.handlers.get(method) ?? [];
    handlers.push(handler);
    this.handlers.set(method, handlers);
  }

  handleMessage(raw) {
    const text = typeof raw === "string" ? raw : Buffer.from(raw).toString("utf8");
    const message = JSON.parse(text);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.message}${message.error.data ? `: ${message.error.data}` : ""}`));
      else pending.resolve(message.result ?? {});
      return;
    }
    if (message.method) {
      for (const handler of this.handlers.get(message.method) ?? []) {
        handler(message.params ?? {});
      }
    }
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      // Best effort cleanup.
    }
  }
}

function onceEvent(client, eventName) {
  return new Promise((resolve) => {
    client.on(eventName, resolve);
  });
}

function findBrowserExecutable() {
  const envCandidates = [
    process.env.CHROME_PATH,
    process.env.GOOGLE_CHROME_BIN,
    process.env.CHROMIUM_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  ];
  const candidates = [...envCandidates.filter(Boolean)];

  if (process.platform === "win32") {
    const roots = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);
    for (const root of roots) {
      candidates.push(
        path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
        path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
      );
    }
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    );
  } else {
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/microsoft-edge",
      "/snap/bin/chromium",
    );
  }

  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
}

async function probeHttpStatus(url) {
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    return response.status;
  } catch {
    return 0;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) return null;
  return response.json();
}

async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start) {
  for (let port = start; port < start + 200; port += 1) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(`Could not find a free local port starting at ${start}.`);
}

async function waitFor(check, message, timeoutMs, intervalMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  if (lastError) throw lastError;
  throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function settle(client) {
  await sleep(350);
  await evalPage(client, "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))", []);
}

function withSmokeParam(rawUrl, mode) {
  const url = new URL(rawUrl);
  url.searchParams.set("smoke", mode);
  return url.href;
}

function withStartParam(rawUrl, startParam) {
  const url = new URL(rawUrl);
  url.searchParams.set("startapp", startParam);
  url.searchParams.set("smoke", `startapp_${startParam}`);
  return url.href;
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--url") parsed.url = args[++index];
    else if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
    else if (arg === "--timeout") parsed.timeout = args[++index];
    else if (arg.startsWith("--timeout=")) parsed.timeout = arg.slice("--timeout=".length);
  }
  return parsed;
}

function numberOption(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createReport() {
  return {
    serverUrl: "",
    startedDevServer: false,
    serverMode: "external",
    httpStatus: 0,
    browserMode: "NOT_RUN",
    telegramMock: "NOT_RUN",
    mainMenuChecked: false,
    mainMenuCategoryCount: 0,
    profileChecked: false,
    historyEmptyStateChecked: false,
    favoritesEmptyStateChecked: false,
    favoriteSaved: false,
    favoriteOpened: false,
    shareChecked: false,
    localDataCleared: false,
    horoscopesChecked: false,
    angelNumbersChecked: false,
    customSelectChecked: false,
    nativeSelectsVisible: 0,
    compatibilityAutosignCases: [],
    compatibilityResultChecked: false,
    compatibilityCalendarChecked: false,
    compatibilityActionChecked: false,
    compatibilityMessageChecked: false,
    compatibilityPairSaved: false,
    compatibilityPairReopened: false,
    compatibilityShareChecked: false,
    vipChecked: 0,
    vipCalculated: 0,
    vipSaved: 0,
    vipShared: 0,
    vipMessageCopyChecked: false,
    vipChartVisualsChecked: 0,
    vipNatalAutosignChecked: false,
    vipNatalPremiumChartChecked: false,
    finalAstroMapsChecked: 0,
    finalAstroLinesChecked: 0,
    finalAstroArrowsChecked: 0,
    finalAstroLegendChecked: false,
    vipPairGateInlinePickerChecked: false,
    vipKartaPlusInlinePickerChecked: false,
    vipThirtyDaysInlinePickerChecked: false,
    deadCtaChecked: false,
    localStoragePrivacyChecked: false,
    giveawaysLocked: false,
    mysticChecked: 0,
    lunarRitualChecked: false,
    lunarCalendarVisualChecked: false,
    lunarCalendarLegendChecked: false,
    tarotFlowChecked: false,
    tarotCardsChecked: 0,
    runeFlowChecked: false,
    runesChecked: 0,
    freeAccessVisible: false,
    telegramReadyCalled: false,
    telegramExpandCalled: false,
    telegramBackButtonChecked: false,
    telegramCategoryBackChecked: false,
    telegramHapticsChecked: false,
    birthMatrixChecked: false,
    birthMatrixDepthChecked: false,
    startParamsChecked: [],
    consoleErrors: [],
    runtimeErrors: [],
    networkErrors: [],
  };
}

function printSkipped(reason, report) {
  console.log("Mini App Smoke: SKIPPED");
  console.log(`Reason: ${reason}`);
  printSummary("SKIPPED", report);
}

function printSummary(status, report) {
  console.log(`Mini App Smoke: ${status}`);
  console.log(`URL: ${report.serverUrl || "n/a"}`);
  console.log(`Server: ${report.startedDevServer ? `started by smoke (${report.serverMode})` : "external/already running"}`);
  console.log(`HTTP status: ${report.httpStatus || "n/a"}`);
  console.log(`Browser mode: ${report.browserMode}`);
  console.log(`Telegram mock: ${report.telegramMock}`);
  console.log(`Main menu checked: ${report.mainMenuChecked ? "YES" : "NO"}`);
  console.log(`Main menu categories checked: ${report.mainMenuCategoryCount}/10`);
  console.log(`Profile checked: ${report.profileChecked ? "YES" : "NO"}`);
  console.log(`History empty state checked: ${report.historyEmptyStateChecked ? "YES" : "NO"}`);
  console.log(`Favorites empty state checked: ${report.favoritesEmptyStateChecked ? "YES" : "NO"}`);
  console.log(`Favorite saved/opened: ${report.favoriteSaved && report.favoriteOpened ? "YES" : "NO"}`);
  console.log(`Share checked: ${report.shareChecked ? "YES" : "NO"}`);
  console.log(`Local data cleared: ${report.localDataCleared ? "YES" : "NO"}`);
  console.log(`Horoscopes checked: ${report.horoscopesChecked ? "YES" : "NO"}`);
  console.log(`Angel Numbers / Ангельские числа checked: ${report.angelNumbersChecked ? "YES" : "NO"}`);
  console.log(`Custom selects checked: ${report.customSelectChecked ? "YES" : "NO"} (native visible: ${report.nativeSelectsVisible})`);
  console.log(`Compatibility result checked: ${report.compatibilityResultChecked ? "YES" : "NO"}`);
  console.log(`Compatibility autosign cases: ${report.compatibilityAutosignCases.length ? report.compatibilityAutosignCases.join(", ") : "NO"}`);
  console.log(`Compatibility 30-day calendar checked: ${report.compatibilityCalendarChecked ? "YES" : "NO"}`);
  console.log(`Compatibility action today checked: ${report.compatibilityActionChecked ? "YES" : "NO"}`);
  console.log(`Compatibility messages checked: ${report.compatibilityMessageChecked ? "YES" : "NO"}`);
  console.log(`Compatibility pair saved/reopened: ${report.compatibilityPairSaved && report.compatibilityPairReopened ? "YES" : "NO"}`);
  console.log(`Compatibility share checked: ${report.compatibilityShareChecked ? "YES" : "NO"}`);
  console.log(`Telegram ready/expand: ${report.telegramReadyCalled && report.telegramExpandCalled ? "YES" : "NO"}`);
  console.log(`Telegram BackButton: ${report.telegramBackButtonChecked ? "YES" : "NO"}`);
  console.log(`Telegram category back: ${report.telegramCategoryBackChecked ? "YES" : "NO"}`);
  console.log(`Telegram haptics: ${report.telegramHapticsChecked ? "YES" : "NO"}`);
  console.log(`VIP cards checked: ${report.vipChecked}/11`);
  console.log(`VIP tools calculated: ${report.vipCalculated}/11`);
  console.log(`VIP save/share checked: ${report.vipSaved}/11 saved, ${report.vipShared}/11 shared`);
  console.log(`VIP chart visuals checked: ${report.vipChartVisualsChecked}/5`);
  console.log(`VIP Natal autosign checked: ${report.vipNatalAutosignChecked ? "YES" : "NO"}`);
  console.log(`VIP Premium Natal Chart checked: ${report.vipNatalPremiumChartChecked ? "YES" : "NO"}`);
  console.log(`Final Astro Maps checked: ${report.finalAstroMapsChecked} (lines max: ${report.finalAstroLinesChecked}, arrows max: ${report.finalAstroArrowsChecked}, legend: ${report.finalAstroLegendChecked ? "YES" : "NO"})`);
  console.log(`VIP pair inline picker checked: ${report.vipPairGateInlinePickerChecked ? "YES" : "NO"}`);
  console.log(`Karta+ pair gate checked: ${report.vipKartaPlusInlinePickerChecked ? "YES" : "NO"}`);
  console.log(`30 days pair gate checked: ${report.vipThirtyDaysInlinePickerChecked ? "YES" : "NO"}`);
  console.log(`Dead CTA checked: ${report.deadCtaChecked ? "YES" : "NO"}`);
  console.log(`VIP message copy checked: ${report.vipMessageCopyChecked ? "YES" : "NO"}`);
  console.log(`localStorage privacy checked: ${report.localStoragePrivacyChecked ? "YES" : "NO"}`);
  console.log(`Free access visible: ${report.freeAccessVisible ? "YES" : "NO"}`);
  console.log(`Giveaways locked: ${report.giveawaysLocked ? "YES" : "NO"}`);
  console.log(`Mystic checked: ${report.mysticChecked >= 3 ? "YES" : "NO"} (${report.mysticChecked}/3)`);
  console.log(`Lunar ritual checked: ${report.lunarRitualChecked ? "YES" : "NO"}`);
  console.log(`Lunar calendar visual checked: ${report.lunarCalendarVisualChecked ? "YES" : "NO"}`);
  console.log(`Lunar calendar legend checked: ${report.lunarCalendarLegendChecked ? "YES" : "NO"}`);
  console.log(`Tarot richer spread checked: ${report.tarotFlowChecked ? "YES" : "NO"} (${report.tarotCardsChecked}/3 cards)`);
  console.log(`Rune richer spread checked: ${report.runeFlowChecked ? "YES" : "NO"} (${report.runesChecked}/3 runes)`);
  console.log(`Birth Matrix / Матрица судьбы checked: ${report.birthMatrixChecked ? "YES" : "NO"}`);
  console.log(`Birth Matrix depth checked: ${report.birthMatrixDepthChecked ? "YES" : "NO"}`);
  console.log(`Startapp params checked: ${report.startParamsChecked.length ? report.startParamsChecked.join(", ") : "NO"}`);
  console.log(`Console errors: ${report.consoleErrors.length}`);
  console.log(`Runtime errors: ${report.runtimeErrors.length}`);
  console.log(`HTTP/network errors: ${report.networkErrors.length}`);
  if (report.consoleErrors.length) console.log(`Console error sample: ${report.consoleErrors.slice(0, 3).join(" | ")}`);
  if (report.runtimeErrors.length) console.log(`Runtime error sample: ${report.runtimeErrors.slice(0, 3).join(" | ")}`);
  if (report.networkErrors.length) console.log(`Network error sample: ${report.networkErrors.slice(0, 3).join(" | ")}`);
}

function formatConsoleArgs(args = []) {
  return args.map((arg) => arg.value ?? arg.description ?? arg.type ?? "").filter(Boolean).join(" ");
}

function isIgnorableNetworkUrl(url) {
  return !url || url.startsWith("data:") || url.includes("/favicon.ico");
}

async function cleanup() {
  for (const child of startedProcesses.reverse()) {
    if (!child || child.exitCode !== null) continue;
    await killProcessTree(child.pid);
  }
  if (tempBrowserProfile) {
    await fs.promises.rm(tempBrowserProfile, { recursive: true, force: true }).catch(() => {});
  }
}

async function killProcessTree(pid) {
  if (!pid) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    return;
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // Process already ended.
  }
}
