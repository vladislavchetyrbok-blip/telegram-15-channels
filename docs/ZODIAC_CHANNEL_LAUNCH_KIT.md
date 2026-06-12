# Zodiac Network: Channel Launch Kit

This document provides the necessary materials to manually create and configure the 13 channels of the Zodiac Network Phase 3. 

**Important Rules before you start:**
- Do NOT use "ru" in the usernames (it cheapens the brand).
- Do NOT run real publish (`npm run publish:due:json`) until the config is fully updated and dry-run is verified.
- The visual style is premium, dark, and aesthetic. Avoid cheap stock imagery.

## Setup Instructions

For each of the 13 channels listed below, perform the following steps:
1. **Create channel manually** in Telegram.
2. **Set the Avatar** and Cover image using the provided prompts in a high-quality AI generator (e.g. Midjourney).
3. **Add the description**.
4. **Publish the pinned message draft** and pin it to the top.
5. **Add the publishing bot** as an Admin with post-sending rights.
6. **Save the Username and Channel ID**, and provide them to the dev team to update `data/zodiacNetwork.ts`.

---

## 1. Гороскоп на сегодня ✨
- **Username:** `zodiac_orbit` (Alternatives: `zodiac_pulse`, `zodiac_today`, `zodiac_cosmic`)
- **Description:** Общая энергия дня и короткий навигатор по всем 12 знакам. Только суть и спокойный контроль.
- **Pinned Draft:** Добро пожаловать в Гороскоп на сегодня ✨
Здесь нет шума и дешевой мистики. Только точная энергия дня, которую можно применить прямо сейчас. Выберите свой знак в меню и читайте, что важно.
- **Avatar Prompt:** Luxury mystic zodiac wheel, cosmic gold details on deep black and violet background, minimalist and premium logo, cinematic light, 8k.

## 2. Овен ♈️ Гороскоп
- **Username:** `aries_orbit` (Alternatives: `aries_pulse`, `aries_today`, `aries_cosmic`)
- **Description:** Персональный канал для Овнов. Прямо, уверенно и по делу. Действие, помноженное на выдержку.
- **Pinned Draft:** Привет, Овен ♈️
Твоя сила — в импульсе, но этот канал научит тебя делать его точным. Читаем каждый день, выбираем главное и не тратим энергию впустую.
- **Avatar Prompt:** Aries symbol, luxury mystic portrait style, dark red and gold energy, cinematic lighting, premium dark zodiac aesthetic, minimal logo.

## 3. Телец ♉️ Гороскоп
- **Username:** `taurus_orbit` (Alternatives: `taurus_pulse`, `taurus_today`, `taurus_cosmic`)
- **Description:** Персональный канал для Тельцов. Спокойная сила, устойчивость и премиальный подход к жизни.
- **Pinned Draft:** Привет, Телец ♉️
Суета нам не подходит. Здесь мы закрепляем результаты, сохраняем комфорт и не делаем резких движений. Твой ежедневный фокус.
- **Avatar Prompt:** Taurus symbol, earth and stone textures, gold accents, calm power, luxury stillness, dark cinematic logo.

## 4. Близнецы ♊️ Гороскоп
- **Username:** `gemini_orbit` (Alternatives: `gemini_pulse`, `gemini_today`, `gemini_cosmic`)
- **Description:** Персональный канал для Близнецов. Элегантная двойственность, идеи и точный фокус в море информации.
- **Pinned Draft:** Привет, Близнецы ♊️
Информации много, но важна только суть. Здесь каждый день мы фильтруем шум и оставляем те мысли, которые работают на тебя.
- **Avatar Prompt:** Gemini symbol, mirror reflections, elegant duality, violet-blue shadows, gold lines, dark premium logo.

## 5. Рак ♋️ Гороскоп
- **Username:** `cancer_orbit` (Alternatives: `cancer_pulse`, `cancer_today`, `cancer_cosmic`)
- **Description:** Персональный канал для Раков. Защита, глубина и тонкое чувствование пространства.
- **Pinned Draft:** Привет, Рак ♋️
Внешний мир бывает громким, поэтому мы создали тихое место. Твой ежедневный ориентир для внутреннего равновесия и силы.
- **Avatar Prompt:** Cancer symbol, moon over dark water, silver-blue light, soft protective atmosphere, premium mystic logo.

## 6. Лев ♌️ Гороскоп
- **Username:** `leo_orbit` (Alternatives: `leo_pulse`, `leo_today`, `leo_cosmic`)
- **Description:** Персональный канал для Львов. Достоинство, свет и сцена без лишнего давления.
- **Pinned Draft:** Привет, Лев ♌️
Тебе не нужно доказывать свое присутствие, оно уже ощущается. Здесь мы настраиваем твой внутренний компас для максимальной уверенности каждый день.
- **Avatar Prompt:** Leo symbol, sun and crown, theatrical stage light, royal gold on black, luxury magazine logo.

## 7. Дева ♍️ Гороскоп
- **Username:** `virgo_orbit` (Alternatives: `virgo_pulse`, `virgo_today`, `virgo_cosmic`)
- **Description:** Персональный канал для Дев. Чистая структура, порядок и ювелирная точность в делах.
- **Pinned Draft:** Привет, Дева ♍️
Когда всё на своих местах, ты непобедим. Каждый день мы убираем лишнее и находим точный фокус для работы, денег и отношений.
- **Avatar Prompt:** Virgo symbol, marble, clean structure, refined gold details, black and gold cinematic precision logo.

## 8. Весы ♎️ Гороскоп
- **Username:** `libra_orbit` (Alternatives: `libra_pulse`, `libra_today`, `libra_cosmic`)
- **Description:** Персональный канал для Весов. Эстетика, баланс и искусство правильного выбора.
- **Pinned Draft:** Привет, Весы ♎️
Твоя сила — в балансе. Здесь мы каждый день настраиваем твою гармонию, помогая делать выбор без сомнений и лишнего стресса.
- **Avatar Prompt:** Libra symbol, balance scales, symmetry, soft gold and violet light, premium mystic logo.

## 9. Скорпион ♏️ Гороскоп
- **Username:** `scorpio_orbit` (Alternatives: `scorpio_pulse`, `scorpio_today`, `scorpio_cosmic`)
- **Description:** Персональный канал для Скорпионов. Магнетизм, глубина и сдержанная интенсивность.
- **Pinned Draft:** Привет, Скорпион ♏️
Здесь нет поверхностных советов. Твой ежедневный компас для тех дней, когда нужно включить свою главную силу на максимум.
- **Avatar Prompt:** Scorpio symbol, shadow and dark red depth, magnetic mystery, black-gold zodiac atmosphere, premium logo.

## 10. Стрелец ♐️ Гороскоп
- **Username:** `sagittarius_orbit` (Alternatives: `sagittarius_pulse`, `sagittarius_today`, `sagittarius_cosmic`)
- **Description:** Персональный канал для Стрельцов. Движение, горизонт и честный вызов.
- **Pinned Draft:** Привет, Стрелец ♐️
Дорога открыта. Здесь мы каждый день выбираем лучшую цель и не размениваемся на мелочи. Твой точный прицел.
- **Avatar Prompt:** Sagittarius symbol, arrow toward horizon, gold trail on dark blue sky, premium mystic logo.

## 11. Козерог ♑️ Гороскоп
- **Username:** `capricorn_orbit` (Alternatives: `capricorn_pulse`, `capricorn_today`, `capricorn_cosmic`)
- **Description:** Персональный канал для Козерогов. Дисциплина, статус и тихая уверенность лидера.
- **Pinned Draft:** Привет, Козерог ♑️
Только фундамент и стратегия. Твой ежедневный чек-лист для укрепления позиции в делах, финансах и жизни.
- **Avatar Prompt:** Capricorn symbol, black-gold zodiac architecture, discipline and status, premium cinematic logo.

## 12. Водолей ♒️ Гороскоп
- **Username:** `aquarius_orbit` (Alternatives: `aquarius_pulse`, `aquarius_today`, `aquarius_cosmic`)
- **Description:** Персональный канал для Водолеев. Идеи, свежий воздух и взгляд в будущее.
- **Pinned Draft:** Привет, Водолей ♒️
Мы не смотрим назад. Здесь твой ежедневный импульс для новых идей, свободы и интеллектуального движения.
- **Avatar Prompt:** Aquarius symbol, electric blue neon, dark cosmic background, gold accents, premium futurism logo.

## 13. Рыбы ♓️ Гороскоп
- **Username:** `pisces_orbit` (Alternatives: `pisces_pulse`, `pisces_today`, `pisces_cosmic`)
- **Description:** Персональный канал для Рыб. Интуиция, тонкие настройки и мягкое движение.
- **Pinned Draft:** Привет, Рыбы ♓️
Твоя интуиция не ошибается, если ей не мешать. Твой ежедневный навигатор в море событий: чувствуй, наблюдай и плыви уверенно.
- **Avatar Prompt:** Pisces symbol, dream fog, violet-blue intuition, dark zodiac shimmer, soft light premium logo.
