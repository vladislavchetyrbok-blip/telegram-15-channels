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
- The 10 main categories are: `Гороскопы`, `Совместимость`, `Матрица судьбы`, `Ангельские числа`, `Нумерология`, `Мистика`, `Таро и руны`, `Луна и ритуалы`, `VIP раздел`, and `Мой профиль`.
- The expected product structure is `Home -> Category -> Feature -> Result`.
- Browser mode works without `window.Telegram`.
- Sign selection works.
- Mini App start params render the intended section after category/sign selection or direct profile routing: `compat`, `compat_gemini`, `mystic`, `vip`, `birth_matrix`, `angel_numbers`, `week`, `profile`, `history`, and `favorites`.
- Profile opens from the main menu and bottom navigation.
- Profile shows the History and Favorites blocks with empty states: `Здесь появятся последние расчёты и открытые разделы` and `Здесь появятся сохранённые расчёты и быстрые переходы`.
- History and Favorites use localStorage only and store safe shortcuts/summaries, not raw personal inputs.
- A safe Angel Numbers item can be saved, appears in Favorites/Profile, opens back into the feature, and can be cleared with `Очистить данные`.
- Safe Share can be clicked without crashing; browser fallback shows copy text or a copied state.
- Basic compatibility flow reaches a stable result state without runtime errors.
- Horoscopes category opens from the main menu.
- Angel Numbers / `Ангельские числа` is visible as a top-level category, opens the existing `angelNumbers` feature, and returns to Home via Back/Main menu.
- VIP tab opens, free access until `17.09.2026` is visible, and all 11 active VIP cards open non-empty detail screens.
- Giveaways is not a top-level main category; it remains locked/disabled inside VIP.
- Open VIP feature screens do not contain `TODO`, `lorem ipsum`, `placeholder`, or unexpected `Скоро появится` text.
- Mystic tab opens and at least three Mystic features can be opened.
- Birth Matrix / `Матрица судьбы` opens from Mystic, accepts a sample birth date, renders a non-empty result, and returns to the Mystic menu.
- Telegram WebApp mock is injected before page load.
- Telegram `ready()` and `expand()` are called.
- Telegram BackButton show/hide/onClick/offClick wiring works: hidden on Home, detail -> category, category -> Home.
- Telegram haptics are callable and do not throw.
- Browser console, runtime, and HTTP/network errors are collected.

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
VIP cards checked: 11/11
Giveaways locked: YES
Mystic checked: YES
Birth Matrix / Матрица судьбы checked: YES
Startapp params checked: compat, compat_gemini, mystic, vip, birth_matrix, angel_numbers, week, profile, history, favorites
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
