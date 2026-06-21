# Aphrodite Network Registry

## Overview
Aphrodite is the main platform for managing multiple Telegram networks and modules. The channel registry provides a unified, read-only view of all channels across these networks.

## Legacy Paused Network
The platform contains a dedicated module for the old 15-channel network, which is completely distinct from the Zodiac active network. This ensures no overlapping of publishing logic or unintended cross-pollination of content. 

### Restored Legacy Channels (15 Total)

**Общие темы — 10**
1. Ідеї для бізнесу (UA)
2. Мужской стиль и вещи (RU)
3. Техника для дома (RU)
4. Україна: можливості та ринок (UA)
5. Деньги и возможности (RU)
6. AI и технологии (RU)
7. Личный прогресс (RU)
8. Авто и комфорт (RU)
9. Дніпро / Город Днепр (RU/UA)
10. Рыбалка и отдых (RU)

**Недвижимость — 5**
1. Инвестиции в недвижимость (RU)
2. Земля и дома / Земля та будинки (RU/UA)
3. Коммерческая недвижимость (RU)
4. Нерухомість Дніпра (UA)
5. Недвижимость Днепра (RU)

## Safety Constraints
* All old 15 channels are currently **paused** (`Пауза`).
* The registry explicitly disables publishing and contains no live server write actions or Telegram API calls.
* The "next step" for these channels is: `Проверить канал и подготовить к перезапуску`.
* The "safety note" explicitly states: `Публикации из реестра отключены`.

## Modular Networks
* **Каналы Зодиака — 13**: A separate, actively developed module with 12 sign-specific channels and 1 general channel.
* **Валюты / Крипта / Металлы**: Placeholder networks for future content modules.
