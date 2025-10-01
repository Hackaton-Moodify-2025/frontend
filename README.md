# Frontend Service Dashboard

Аналитический дашборд для оценки пользовательских отзывов о банке https://www.gazprombank.ru/  

---

## Возможности

- **Reviews Dashboard** — список отзывов с фильтрацией, сортировкой и drill-down в детальные карточки.
- **Analytics Dashboard** — полный BI-дашборд:
  - KPI-карточки (количество отзывов, распределение тональностей и т.д.)
  - Диаграмма по тональностям (PieChart)
  - Популярные темы (BarChart)
  - Динамика количества отзывов по датам (LineChart)
  - Геоаналитика: карта с распределением отзывов по городам
-  **Детальная карточка отзыва** — с темами, тональностями и переходом на оригинальный источник.
-  Лёгкий и быстрый фронт на **Vite + React + Chakra UI**.

---

## Стек

- [React 18](https://react.dev/)  
- [Vite](https://vitejs.dev/)  
- [Chakra UI](https://chakra-ui.com/)  
- [React Router](https://reactrouter.com/)  
- [Recharts](https://recharts.org/)  
- [React Simple Maps](https://www.react-simple-maps.io/)  
- [Framer Motion](https://www.framer.com/motion/)  

---

## Установка и запуск

```bash
# клонирование репозитория
git clone https://github.com/Hackaton-Moodify-2025/frontend (если по https)
cd hack-dashboard

# установка зависимостей
npm install

# запуск в dev-режиме
npm run dev
```

Приложение будет доступно на [http://localhost:5173](http://localhost:5173).

---

## Структура проекта

```
src/
  components/         # UI-компоненты (KPI, графики, карты, навбар и т.д.)
  pages/              # страницы (Reviews, Analytics, API, DataLens, Review details)
  hooks/              # кастомные React-хуки
  services/           # работа с API и бэкендом
  utils/              # вспомогательные утилиты
  theme.js            # тема Chakra UI
  App.jsx             # роутинг приложения
  main.jsx            # точка входа
public/
  logos/              # логотипы сайтов-источников
  preview.png         # скриншот для README
```

---

## Основные страницы

- `/` — **Отзывы (ReviewsPage)**  
- `/review/:id` — **Детальный отзыв (ReviewPage)**  
- `/analytics` — **Аналитика (AnalyticsDashboard)**  
- `/api` — тест работы API  
- `/datalens` — встроенные внешние визуализации  
