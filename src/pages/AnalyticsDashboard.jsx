import {
  Box,
  SimpleGrid,
  Heading,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  Badge,
  useDisclosure,
  Collapse,
  Divider
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FiFilter, FiRefreshCw, FiDownload } from "react-icons/fi";

// Импорт существующих компонентов
import KpiCards from "../components/KpiCards.jsx";
import SentimentPie from "../components/SentimentPie.jsx";
import TopicsBarChart from "../components/TopicsBarChart.jsx";
import ReviewsTimeline from "../components/ReviewsTimeline.jsx";

// Импорт новых компонентов
import FilterPanel from "../components/FilterPanel.jsx";
import AdvancedKPI from "../components/AdvancedKPI.jsx";
import SentimentAnalysis from "../components/SentimentAnalysis.jsx";
import TopicsInsights from "../components/TopicsInsights.jsx";
import GeographicInsights from "../components/GeographicInsights.jsx";
import ReviewsTable from "../components/ReviewsTable.jsx";
import AdvancedTimelines from "../components/AdvancedTimelines.jsx";
import SmartInsights from "../components/SmartInsights.jsx";
import ExportTools from "../components/ExportTools.jsx";
import WordCloudAnalysis from "../components/WordCloudAnalysis.jsx";
import ActivityHeatMap from "../components/ActivityHeatMap.jsx";
import LiveAlerts from "../components/LiveAlerts.jsx";

// Импорт данных
import { mockReviews } from "../mocks/reviews.js";
import { siteReviews } from "../mocks/siteReviews.js";

export default function AnalyticsDashboard() {
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  // Состояние фильтров
  const [filters, setFilters] = useState({
    dateRange: [0, 365], // последний год по умолчанию
    ratingRange: [1, 5],
    topics: [],
    sentiments: [],
    cities: [],
    searchText: ""
  });

  // Функция для фильтрации стоп-слов
  const filterStopWords = (text) => {
    if (!text) return '';
    const stopWords = [
      'и', 'в', 'на', 'с', 'по', 'для', 'от', 'к', 'о', 'об', 'за', 'до', 'из', 'у', 'во', 'со',
      'а', 'но', 'да', 'или', 'если', 'то', 'что', 'как', 'где', 'куда', 'когда', 'почему',
      'через', 'при', 'под', 'над', 'без', 'между', 'среди', 'около', 'вокруг', 'против',
      'это', 'тот', 'та', 'те', 'этот', 'эта', 'эти', 'все', 'всё', 'каждый', 'любой',
      'мне', 'меня', 'мой', 'моя', 'моё', 'мои', 'ты', 'тебя', 'твой', 'твоя', 'твоё', 'твои',
      'он', 'она', 'оно', 'они', 'его', 'её', 'их', 'ему', 'ей', 'им', 'них', 'нём', 'ней',
      'быть', 'есть', 'был', 'была', 'было', 'были', 'будет', 'будут', 'буду', 'будешь',
      'не', 'ни', 'нет', 'никак', 'никто', 'ничто', 'нигде', 'никуда', 'никогда',
      'очень', 'более', 'менее', 'самый', 'тоже', 'также', 'ещё', 'уже', 'только', 'лишь'
    ];
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .join(' ');
  };

  // Объединение и обработка данных
  const combinedData = useMemo(() => {
    // Объединяем данные из predictions и siteReviews
    const predictions = mockReviews.predictions || [];
    const reviews = siteReviews || [];

    // Создаем мапу для быстрого поиска по ID
    const reviewsMap = new Map();
    reviews.forEach(review => {
      reviewsMap.set(review.id, review);
    });

    // Объединяем данные
    const combined = predictions.map(prediction => {
      const review = reviewsMap.get(prediction.id);
      return {
        ...prediction,
        ...review,
        // Обеспечиваем совместимость данных
        topics: prediction.topics || [],
        sentiments: prediction.sentiments || [],
        // Добавляем очищенный от стоп-слов текст для аналитики
        cleanText: filterStopWords(review?.text || prediction?.text || '')
      };
    }).filter(item => item.id); // Убираем элементы без ID

    return combined;
  }, []);

  // Применение фильтров
  const filteredData = useMemo(() => {
    return combinedData.filter(item => {
      // Фильтр по тексту (с учетом стоп-слов)
      if (filters.searchText && item.text) {
        const searchClean = filterStopWords(filters.searchText);
        const searchLower = searchClean.toLowerCase();
        const matchText = item.cleanText.toLowerCase().includes(searchLower) ||
          item.text.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          (item.title && item.title.toLowerCase().includes(filters.searchText.toLowerCase()));
        if (!matchText) return false;
      }

      // Фильтр по рейтингу
      if (item.rating) {
        const rating = parseInt(item.rating);
        if (!isNaN(rating)) {
          if (rating < filters.ratingRange[0] || rating > filters.ratingRange[1]) {
            return false;
          }
        }
      }

      // Фильтр по темам
      if (filters.topics.length > 0) {
        const hasMatchingTopic = filters.topics.some(topic =>
          item.topics?.includes(topic)
        );
        if (!hasMatchingTopic) return false;
      }

      // Фильтр по настроениям
      if (filters.sentiments.length > 0) {
        const hasMatchingSentiment = filters.sentiments.some(sentiment =>
          item.sentiments?.includes(sentiment)
        );
        if (!hasMatchingSentiment) return false;
      }

      // Фильтр по городам (с нормализацией)
      if (filters.cities.length > 0) {
        const normalizeCity = (city) => {
          if (!city) return "Не указан";

          const normalized = city.toString().trim();

          const cityMappings = {
            'спб': 'Санкт-Петербург',
            'санкт-петербург': 'Санкт-Петербург',
            'петербург': 'Санкт-Петербург',
            'ленинград': 'Санкт-Петербург',
            'москва': 'Москва',
            'мск': 'Москва',
            'на волге': 'Поволжье',
            'волга': 'Поволжье',
            'россия': 'Россия (общее)',
            'рф': 'Россия (общее)',
            'вернуласьчитаю': 'Не указан',
          };

          const lower = normalized.toLowerCase();
          return cityMappings[lower] || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        };

        const normalizedItemCity = normalizeCity(item.city);
        if (!filters.cities.includes(normalizedItemCity)) return false;
      }

      // Фильтр по дате (упрощенная версия)
      if (item.date && filters.dateRange[1] < 365) {
        const itemDate = new Date(item.date);
        const daysAgo = Math.floor((new Date() - itemDate) / (1000 * 60 * 60 * 24));
        if (daysAgo < filters.dateRange[0] || daysAgo > filters.dateRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [combinedData, filters]);

  // Подготовка данных для существующих компонентов
  const legacyStats = useMemo(() => {
    const total = filteredData.length;
    const positive = filteredData.filter(item =>
      item.sentiments?.includes("положительно")).length;
    const neutral = filteredData.filter(item =>
      item.sentiments?.includes("нейтрально")).length;
    const negative = filteredData.filter(item =>
      item.sentiments?.includes("отрицательно")).length;

    return [
      { label: "Всего отзывов", value: total },
      { label: "Позитивные", value: positive, color: "green.500" },
      { label: "Нейтральные", value: neutral, color: "gray.500" },
      { label: "Негативные", value: negative, color: "red.500" },
    ];
  }, [filteredData]);

  const sentimentData = useMemo(() => {
    const positive = filteredData.filter(item =>
      item.sentiments?.includes("положительно")).length;
    const neutral = filteredData.filter(item =>
      item.sentiments?.includes("нейтрально")).length;
    const negative = filteredData.filter(item =>
      item.sentiments?.includes("отрицательно")).length;

    return [
      { name: "Позитивные", value: positive },
      { name: "Нейтральные", value: neutral },
      { name: "Негативные", value: negative },
    ];
  }, [filteredData]);

  const topicsData = useMemo(() => {
    const topicsCount = {};
    filteredData.forEach(item => {
      item.topics?.forEach(topic => {
        topicsCount[topic] = (topicsCount[topic] || 0) + 1;
      });
    });

    return Object.entries(topicsCount)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredData]);

  const timelineData = useMemo(() => {
    const dateGroups = {};
    filteredData.forEach(item => {
      if (item.date) {
        const date = item.date.split('T')[0]; // Берем только дату
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      }
    });

    return Object.entries(dateGroups)
      .map(([date, reviews]) => ({ date, reviews }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Последние 30 дней
  }, [filteredData]);

  const clearAllFilters = () => {
    setFilters({
      dateRange: [0, 365],
      ratingRange: [1, 5],
      topics: [],
      sentiments: [],
      cities: [],
      searchText: ""
    });
  };

  const activeFiltersCount =
    filters.topics.length +
    filters.sentiments.length +
    filters.cities.length +
    (filters.searchText ? 1 : 0) +
    (filters.dateRange[1] < 365 ? 1 : 0) +
    (filters.ratingRange[0] > 1 || filters.ratingRange[1] < 5 ? 1 : 0);

  return (
    <Box py={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Заголовок с контролами */}
        <HStack justify="space-between" px={6}>
          <Heading color="brand.500">
            🚀 Продвинутая аналитика отзывов
          </Heading>
          <HStack spacing={3}>
            <ExportTools data={filteredData} filters={filters} />
            <Button
              leftIcon={<Icon as={FiFilter} />}
              onClick={onFilterToggle}
              variant={isFilterOpen ? "solid" : "outline"}
              colorScheme="brand"
              size="sm"
            >
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge ml={2} colorScheme="red" variant="solid" borderRadius="full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              isDisabled={activeFiltersCount === 0}
            >
              Сброс
            </Button>
            <ExportTools data={filteredData} filters={filters} />
            <ExportTools data={filteredData} filters={filters} />
          </HStack>
        </HStack>

        {/* Панель фильтров */}
        <Box px={6}>
          <Collapse in={isFilterOpen} animateOpacity>
            <FilterPanel filters={filters} onFiltersChange={setFilters} data={combinedData} />
          </Collapse>
        </Box>

        <Box px={6}>
          <VStack spacing={8} align="stretch">
            {/* Продвинутые KPI */}
            <AdvancedKPI data={filteredData} />

            {/* Умные инсайты - во всю ширину */}
            <SmartInsights data={filteredData} />

            {/* Основная статистика - две колонки */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
              <SentimentAnalysis data={filteredData} />
              <TopicsInsights data={filteredData} />
            </SimpleGrid>

            {/* Временные тренды - во всю ширину */}
            <AdvancedTimelines data={filteredData} />

            {/* Классические компоненты в адаптивной сетке */}
            <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
              <SentimentPie data={sentimentData} />
              <TopicsBarChart data={topicsData} />
              <GeographicInsights data={filteredData} />
            </SimpleGrid>

            {/* Обычные KPI */}
            <KpiCards stats={legacyStats} />

            {/* Временная линия */}
            <ReviewsTimeline data={timelineData} />

            {/* Продвинутые компоненты в двух колонках */}
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
              <WordCloudAnalysis data={filteredData} />
              <ActivityHeatMap data={filteredData} />
            </SimpleGrid>

            {/* Таблица детальных отзывов */}
            <ReviewsTable reviews={filteredData} />
          </VStack>
        </Box>

        {/* Живые алерты - плавающий компонент */}
        <LiveAlerts data={filteredData} />
      </VStack>
    </Box>
  );
}
