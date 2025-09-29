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
  Divider,
  Alert,
  AlertIcon,
  Text,
  Spinner,
  Center
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FiFilter, FiRefreshCw, FiDownload } from "react-icons/fi";

// API Hook
import { useAnalytics } from "../hooks/useAPI";

// Text analysis utility
import { filterStopWords } from "../utils/textAnalysis";

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
import { AnalyticsSkeleton } from "../components/LoadingSkeleton";
import AdvancedTimelines from "../components/AdvancedTimelines.jsx";
import SmartInsights from "../components/SmartInsights.jsx";
import ExportTools from "../components/ExportTools.jsx";
import WordCloudAnalysis from "../components/WordCloudAnalysis.jsx";
import ActivityHeatMap from "../components/ActivityHeatMap.jsx";
import LiveAlerts from "../components/LiveAlerts.jsx";

export default function AnalyticsDashboard() {
  const { isOpen: isFilterOpen, onToggle: onFilterToggle, onOpen: onFilterOpen } = useDisclosure();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  // Функции для получения дат по умолчанию (последние 180 дней)
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 180);
    return date.toISOString().split('T')[0];
  };

  const getDefaultDateTo = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Состояние фильтров с датами по умолчанию на последние 180 дней
  const [filters, setFilters] = useState({
    dateFrom: getDefaultDateFrom(),
    dateTo: getDefaultDateTo(),
    ratingRange: [1, 5],
    topics: [],
    sentiments: [],
    cities: [],
    searchText: ""
  });

  // Мемоизированные фильтры для API
  const apiFilters = useMemo(() => ({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    // Можно добавить другие фильтры если нужно
    // topic: filters.topics.length === 1 ? filters.topics[0] : '',
    // sentiment: filters.sentiments.length === 1 ? filters.sentiments[0] : ''
  }), [filters.dateFrom, filters.dateTo]);

  // Fetch analytics data from API with current filters
  const { data: analyticsData, loading, error, refresh } = useAnalytics(apiFilters);

  // Обработка данных из API
  const combinedData = useMemo(() => {
    if (!analyticsData) {
      console.log('No analyticsData available');
      return [];
    }

    console.log('Analytics data structure:', {
      keys: Object.keys(analyticsData),
      reviewsCount: analyticsData.reviews?.length,
      predictionsCount: analyticsData.predictions?.length,
      hasReviews: !!analyticsData.reviews,
      hasPredictions: !!analyticsData.predictions
    });

    if (!analyticsData.reviews) {
      console.warn('No reviews in analytics data');
      return [];
    }

    const reviews = analyticsData.reviews;
    const predictions = analyticsData.predictions || [];

    // Создаем мапу предикшенов для быстрого поиска
    const predictionsMap = new Map();
    predictions.forEach(prediction => {
      predictionsMap.set(prediction.id, prediction);
    });

    // Объединяем данные
    const combined = reviews.map(review => {
      const prediction = predictionsMap.get(review.id);
      return {
        ...review,
        // Добавляем данные предикшена если есть
        topics: review.topics || prediction?.topics || [],
        sentiments: review.sentiments || prediction?.sentiments || [],
        // Добавляем очищенный от стоп-слов текст для аналитики
        cleanText: filterStopWords(review.text || '')
      };
    }).filter(item => item.id); // Убираем элементы без ID

    return combined;
  }, [analyticsData]);

  // Применение дополнительных фильтров (основная фильтрация по датам происходит на бэкенде)
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

      // Фильтрация по датам теперь выполняется на бэкенде

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
      dateFrom: getDefaultDateFrom(),
      dateTo: getDefaultDateTo(),
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
    (filters.dateFrom || filters.dateTo ? 1 : 0) +
    (filters.ratingRange[0] > 1 || filters.ratingRange[1] < 5 ? 1 : 0);

  const handleQuickFilter = (updates, options = {}) => {
    if (!updates || Object.keys(updates).length === 0) {
      return;
    }

    setFilters((prev) => {
      const next = { ...prev };

      if (Object.prototype.hasOwnProperty.call(updates, "sentiments")) {
        const sentiments = updates.sentiments || [];
        next.sentiments = options.appendSentiments
          ? Array.from(new Set([...prev.sentiments, ...sentiments]))
          : sentiments;
      }

      if (Object.prototype.hasOwnProperty.call(updates, "topics")) {
        const topics = updates.topics || [];
        next.topics = options.appendTopics
          ? Array.from(new Set([...prev.topics, ...topics]))
          : topics;
      }

      if (Object.prototype.hasOwnProperty.call(updates, "cities")) {
        const cities = updates.cities || [];
        next.cities = options.appendCities
          ? Array.from(new Set([...prev.cities, ...cities]))
          : cities;
      }

      if (Object.prototype.hasOwnProperty.call(updates, "ratingRange")) {
        next.ratingRange = updates.ratingRange;
      }

      if (Object.prototype.hasOwnProperty.call(updates, "searchText")) {
        next.searchText = updates.searchText ?? "";
      }

      if (Object.prototype.hasOwnProperty.call(updates, "dateFrom")) {
        next.dateFrom = updates.dateFrom;
      }

      if (Object.prototype.hasOwnProperty.call(updates, "dateTo")) {
        next.dateTo = updates.dateTo;
      }

      return next;
    });

    if (!isFilterOpen) {
      onFilterOpen();
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box py={6} bg={bgColor} minH="100vh">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" px={6}>
            <Heading color="brand.500">
              🚀 Продвинутая аналитика отзывов
            </Heading>
            <HStack spacing={3}>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.600">
                Загрузка данных...
              </Text>
            </HStack>
          </HStack>
          <Box px={6}>
            <AnalyticsSkeleton />
          </Box>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box py={6} bg={bgColor} minH="100vh">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" px={6}>
            <Heading color="brand.500">
              🚀 Продвинутая аналитика отзывов
            </Heading>
          </HStack>
          <Box px={6}>
            <Alert status="error" rounded="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ошибка загрузки аналитических данных</Text>
                <Text fontSize="sm">{error}</Text>
              </Box>
              <Button ml="auto" onClick={refresh}>
                Повторить
              </Button>
            </Alert>
          </Box>
        </VStack>
      </Box>
    );
  }

  // No data state
  if (!analyticsData || !combinedData.length) {
    return (
      <Box py={6} bg={bgColor} minH="100vh">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" px={6}>
            <Heading color="brand.500">
              🚀 Продвинутая аналитика отзывов
            </Heading>
          </HStack>
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                Нет данных для аналитики
              </Text>
              <Button onClick={refresh} colorScheme="brand">
                Обновить данные
              </Button>
            </VStack>
          </Center>
        </VStack>
      </Box>
    );
  }

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
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={refresh}
              variant="outline"
              colorScheme="brand"
              size="sm"
              isLoading={loading}
            >
              Обновить
            </Button>
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

            {/* Основная статистика - растянутые блоки */}
            <VStack spacing={6} align="stretch">
              <SentimentAnalysis data={filteredData} onQuickFilter={handleQuickFilter} />
              <TopicsInsights data={filteredData} onQuickFilter={handleQuickFilter} />
            </VStack>

            {/* Временные тренды - во всю ширину */}
            <AdvancedTimelines data={filteredData} />

            {/* Географические инсайты - во всю ширину */}

            <GeographicInsights data={filteredData} onQuickFilter={handleQuickFilter} />

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
