export type VipPreviewFeature = {
  title: string;
  description: string;
  status: "preview-only" | "future" | "blocked-until-payments";
  dependency: string;
  riskLevel: "low" | "medium" | "high";
};

export type VipBoundaryRule = {
  label: string;
  description: string;
  protectedArea: string;
};

export const MOCK_VIP_PREVIEW_FEATURES: VipPreviewFeature[] = [
  {
    title: "Расширенная Матрица судьбы",
    description: "Глубокий разбор путей, уроков и скрытых талантов.",
    status: "blocked-until-payments",
    dependency: "Профиль и платежи",
    riskLevel: "medium",
  },
  {
    title: "Глубокие мистические числа",
    description: "Персональные значения числовых паттернов и мягкие подсказки по времени.",
    status: "preview-only",
    dependency: "Генерация контента",
    riskLevel: "low",
  },
  {
    title: "Персональные аффирмации",
    description: "Подборка фраз для любви, карьеры и внутреннего фокуса.",
    status: "preview-only",
    dependency: "Контентная база",
    riskLevel: "low",
  },
  {
    title: "Расширенная совместимость",
    description: "Более детальная динамика отношений, риски и точки роста.",
    status: "blocked-until-payments",
    dependency: "Астро-движок и платежи",
    riskLevel: "medium",
  },
  {
    title: "Карта отношений",
    description: "Визуальная схема связей и ролей внутри близкого круга.",
    status: "future",
    dependency: "Хранение профиля",
    riskLevel: "high",
  },
  {
    title: "Лунный календарь",
    description: "Личные подсказки по фазам Луны и ритму недели.",
    status: "future",
    dependency: "Астро-движок",
    riskLevel: "medium",
  },
  {
    title: "Сохраненный профиль",
    description: "Чтобы не вводить данные повторно между сессиями.",
    status: "blocked-until-payments",
    dependency: "База и авторизация",
    riskLevel: "high",
  },
  {
    title: "Личные подсказки дня",
    description: "Премиум-прогнозы в приложении после будущего ручного допуска.",
    status: "blocked-until-payments",
    dependency: "Telegram и entitlement",
    riskLevel: "high",
  },
];

export const MOCK_VIP_BOUNDARY_RULES: VipBoundaryRule[] = [
  { label: "Без оплаты", description: "Платежи не запускаются и не имитируются для пользователя.", protectedArea: "Payments" },
  { label: "VIP закрыт", description: "Премиум-доступ не открывается.", protectedArea: "Entitlement" },
  { label: "Без подписки", description: "Тариф пользователя не создается и не меняется.", protectedArea: "Database" },
  { label: "Без базы", description: "Профиль и транзакции не сохраняются.", protectedArea: "Database" },
  { label: "Без Telegram API", description: "Этот экран не вызывает бота и не отправляет сообщения.", protectedArea: "Telegram API" },
  { label: "Публикации не меняются", description: "Live-постинг каналов не затронут.", protectedArea: "Publishing" },
  { label: "Cron/workflow не менялись", description: "Автоматизация остается закрытой.", protectedArea: "Infrastructure" },
];
