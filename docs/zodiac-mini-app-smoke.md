# Zodiac Mini App Smoke

Use the Mini App smoke check after Mini App, VIP, Mystic, navigation, or Telegram WebApp integration changes:

```bash
npm run zodiac:miniapp:smoke
```

By default the script checks `http://localhost:3000/compatibility`. If that URL is not already running, the script starts a local Next server on a free port and stops it at the end. When a production build exists it prefers `next start`; otherwise it falls back to dev mode.

To check an already running deployment or local server:

```bash
npm run zodiac:miniapp:smoke -- --url http://localhost:3000/compatibility
```

## What It Checks

- `/compatibility` returns HTTP 200 and renders the Mini App home screen.
- The main screen contains the hero title `Астрологический центр`, subtitle, CTA, VIP free-access badge, and 10 large category cards.
- The 10 main categories are, in order: `Гороскопы`, `Совместимость`, `Ангельские числа`, `Матрица судьбы`, `Нумерология`, `Мистика`, `Таро и руны`, `Луна и ритуалы`, `VIP раздел`, and `Мой профиль`.
- Angel Numbers / `Ангельские числа` must be visible in the first screen zone and must not be hidden only inside VIP or Mystic.
- `Розыгрыши` must not be a top-level main category; it remains locked/preview inside VIP.
- The expected product structure is `Home -> Category -> Feature -> Result`.
- Browser mode works without `window.Telegram`.
- Sign selection works.
- Mini App start params render the intended section after category/sign selection or direct profile routing: `compat`, `compat_love`, `compat_reconciliation`, `compat_gemini`, `mystic`, `vip`, `birth_matrix`, `angel_numbers`, `week`, `profile`, `history`, and `favorites`.
- Profile opens from the main menu and bottom navigation.
- Profile shows the History and Favorites blocks with empty states: `Здесь появятся последние расчёты и открытые разделы` and `Здесь появятся сохранённые расчёты и быстрые переходы`.
- History and Favorites use localStorage only and store safe shortcuts/summaries, not raw personal inputs.
- A safe Angel Numbers item can be saved, appears in Favorites/Profile, opens back into the feature, and can be cleared with `Очистить данные`.
- Safe Share can be clicked without crashing; browser fallback shows copy text or a copied state.
- Mini App forms use custom `ZodiacSelect` controls in Telegram/browser mode; visible native `<select>` controls inside active Mini App screens are treated as a regression.
- Compatibility follows `Compatibility -> Pair Setup -> Relationship Card -> 30-Day Couple Calendar -> Actions / Messages / Save / Share`.
- Compatibility result must show the visual markers `Карта отношений`, `Главный совет`, `Эмоции`, `Общение`, and `Быт / ритм`, plus a non-empty `FinalAstroMap` with energy lines, arrows, and legend.
- Compatibility smoke chooses Love mode, fills pair data, verifies birth-date autosign cases `1998-06-15 -> Близнецы`, `2000-03-21 -> Овен`, and `2000-12-22 -> Козерог`, reaches a detailed result, opens the 30-day couple calendar, opens `Что написать`, verifies the message copy state `Скопировано`, opens `Действие сегодня`, saves the pair with the `Пара сохранена` state, reopens it from Profile/Favorites/History, and checks safe Share.
- Compatibility local retention stores only safe summary fields: first sign, second sign, relationship mode, score tier, label, feature key, and timestamp. It must not store names, birth dates, birth times, city query, selected city id, raw result text, or raw message text.
- Horoscopes category opens from the main menu.
- Angel Numbers / `Ангельские числа` is visible as a top-level category, opens the existing `angelNumbers` feature, and returns to Home via Back/Main menu.
- VIP tab opens, free access until `17.09.2026` is visible, and all 11 active VIP cards open as functional tools with an input block, calculate/show action, non-empty `Результат VIP`, safe Save, and safe Share.
- VIP pair tools support inline pair selection when no pair exists, show `Нужна пара для расчёта`, and can calculate without sending users into a dead end.
- VIP top-tab pair gates `Карта+` and `30 дней` must route from `Выбрать знаки здесь` into the matching inline VIP pair picker and produce a result.
- Natal chart VIP CTA buttons `Смотреть бесплатные расширения`, `Глубже про отношения`, `Фокус месяца`, and `Стиль лучших дней` must open the intended VIP tool; any button-looking CTA that does nothing is a regression.
- VIP Natal Chart, Extended Compatibility, Mental Map, Numerology, and VIP Mystic Day render a non-empty symbolic `FinalAstroMap` / `AstroChartVisual` block after calculation.
- Final AstroMap checks require a visible SVG map, 12-sign wheel, highlighted selected sign(s), at least five energy lines, at least five arrows, a legend, and the honest caption that the map is symbolic and not an ephemeris/house/ascendant calculation.
- VIP Natal Chart has a dedicated premium smoke path: enter `1998-06-15`, `23:55`, and `Dnipro`, verify auto-sign `Близнецы`, calculate, render the structured hero `Символическая натальная карта`, show the premium natal circle/aspect lines/legend, show the honesty badge `без точных домов и асцендента`, render 6 internal tabs (`Главное`, `Характер`, `Отношения`, `Деньги`, `Рост`, `Сегодня`), verify at least 5 structured sections are reachable, and keep one bottom Save/Share action area.
- Giveaways is not a top-level main category; it remains locked/disabled inside VIP.
- Open VIP feature screens do not contain `TODO`, `lorem ipsum`, `placeholder`, or unexpected `Скоро появится` text.
- VIP smoke checks all 11 active tools: natal chart, monthly forecast, name profile, compatibility, mental map, 30-day couple calendar, message helper, numerology, angel numbers, talismans, and VIP mystic day.
- VIP message helper must show `Скопировано` after copying a generated message.
- VIP local retention must store only safe shortcuts: feature key, sign slugs, relationship mode, score tier, label, section, mode, and timestamp. It must not store names, birth dates, birth times, birth city/city query, raw input, raw result text, or raw message text.
- Mystic tab opens and at least three Mystic features can be opened.
- Birth Matrix / `Матрица судьбы` opens from Mystic, accepts sample date `1998-06-15`, renders the premium symbolic result, visual matrix, central number, legend, 6 sections (`Главное`, `Характер`, `Отношения`, `Деньги`, `Урок`, `Сегодня`), safe Save/Share states, and returns to the Mystic menu.
- Birth Matrix local retention stores only safe summary fields such as feature key, matrix type, archetype key, central number, label, and timestamp. It must not store raw birth date, name, result text, or generated text.
- Telegram WebApp mock is injected before page load.
- Telegram `ready()` and `expand()` are called.
- Telegram BackButton show/hide/onClick/offClick wiring works: hidden on Home, detail -> category, category -> Home.
- Telegram haptics are callable and do not throw.
- Browser console, runtime, and HTTP/network errors are collected.

## Tarot / Rune Richer Flow Checks

The smoke command now verifies the richer Mystic Tarot/Rune flow, not only that the screens open.

- Tarot: opens `Таро`, selects `Решение`, selects `3 карты`, enters a test question, calculates, checks `data-tarot-spread-visual`, 3 visible cards, spread positions, `Краткий ответ`, `Действие сегодня`, safe Save, safe Share, and localStorage privacy.
- Rune: opens `Руна`, selects `Три руны`, enters a test question, calculates, checks `data-rune-spread-visual`, 3 visible runes, `Главная руна`, `Сила`, `Риск`, `Действие сегодня`, `Талисман`, safe Save, safe Share, and localStorage privacy.
- The raw test questions must not appear in retention localStorage, analytics payloads, share text, or saved shortcuts.

Expected PASS summary includes:

```text
Tarot richer spread checked: YES (3/3 cards)
Rune richer spread checked: YES (3/3 runes)
```

## Result Meanings

- `Mini App Smoke: PASS` means the browser flow, Telegram mock flow, VIP, Mystic, and error checks completed successfully.
- `Mini App Smoke: FAIL` means Chrome/CDP was available and a real UI/runtime/network regression was detected.
- `Mini App Smoke: SKIPPED` means a headless Chrome/Edge CDP browser was not available in the environment. Static checks can still pass, but Mini App UI regression coverage did not run.

Expected successful summary shape:

```text
Mini App Smoke: PASS
Browser mode: PASS
Telegram mock: PASS
Main menu checked: YES
Main menu categories checked: 10/10
Horoscopes checked: YES
Angel Numbers / Ангельские числа checked: YES
Custom selects checked: YES (native visible: 0)
VIP cards checked: 11/11
VIP tools calculated: 11/11
VIP save/share checked: 11/11 saved, 11/11 shared
VIP chart visuals checked: 5/5
VIP Natal autosign checked: YES
VIP Premium Natal Chart checked: YES
Final Astro Maps checked: 6 (lines max: 5, arrows max: 5, legend: YES)
VIP pair inline picker checked: YES
Karta+ pair gate checked: YES
30 days pair gate checked: YES
Dead CTA checked: YES
VIP message copy checked: YES
Giveaways locked: YES
Mystic checked: YES
Birth Matrix / Матрица судьбы checked: YES
Birth Matrix depth checked: YES
Compatibility result checked: YES
Compatibility autosign cases: 1998-06-15 -> Близнецы, 2000-03-21 -> Овен, 2000-12-22 -> Козерог
Compatibility 30-day calendar checked: YES
Compatibility action today checked: YES
Compatibility messages checked: YES
Compatibility pair saved/reopened: YES
Compatibility share checked: YES
Startapp params checked: compat, compat_love, compat_reconciliation, compat_gemini, mystic, vip, birth_matrix, angel_numbers, week, profile, history, favorites
Profile checked: YES
History empty state checked: YES
Favorites empty state checked: YES
Favorite saved/opened: YES
Share checked: YES
Local data cleared: YES
Console errors: 0
Runtime errors: 0
HTTP/network errors: 0
```

This smoke command never runs live publish, never changes Zodiac ledgers, and does not enable weekly live schedule.
