# ZODIAC GEMINI WEEKLY VISUAL PILOT

## Status
- **Gemini pilot готов**: 7/7
- **Сами изображения не изменяются.** (Они загружены и готовы к использованию).

## Paths to Files
* `public/assets/zodiac-weekly/gemini/monday.jpg`
* `public/assets/zodiac-weekly/gemini/tuesday.jpg`
* `public/assets/zodiac-weekly/gemini/wednesday.jpg`
* `public/assets/zodiac-weekly/gemini/thursday.jpg`
* `public/assets/zodiac-weekly/gemini/friday.jpg`
* `public/assets/zodiac-weekly/gemini/saturday.jpg`
* `public/assets/zodiac-weekly/gemini/sunday.jpg`

## Validation
Как проверять через validator:
Выполните команду в корне проекта:
```bash
npm run zodiac:weekly-assets:validate
```
Эта команда проверит наличие всех 91 ожидаемых изображений, и подтвердит, что 7/7 для Gemini присутствуют и корректны, а для остальных знаков произойдет fallback на текущие (если weekly assets отсутствуют).
