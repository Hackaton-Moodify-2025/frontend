import {
  Box,
  SimpleGrid,
  VStack,
  Button,
  useColorModeValue,
  useDisclosure,
  Collapse,
  Alert,
  AlertIcon,
  Text,
  Center
} from "@chakra-ui/react";
import { useState, useMemo } from "react";

// API Hook
import { useAnalytics } from "../hooks/useAPI";

// Text analysis utility
import { filterStopWords } from "../utils/textAnalysis";

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
import ExperienceCommandCenter from "../components/ExperienceCommandCenter.jsx";
import ExperiencePulse from "../components/ExperiencePulse.jsx";
import BreakoutInsights from "../components/BreakoutInsights.jsx";
import CustomerSpotlights from "../components/CustomerSpotlights.jsx";

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

  const latestReviewDate = useMemo(() => {
    let latest = null;
    filteredData.forEach(item => {
      if (!item.date) {
        return;
      }

      const parsed = new Date(item.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }

      if (!latest || parsed > latest) {
        latest = parsed;
      }
    });

    return latest;
  }, [filteredData]);

  const hasRecentData = useMemo(() => {
    if (!latestReviewDate) {
      return false;
    }

    const now = new Date();
    const diffInDays = (now.getTime() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 30;
  }, [latestReviewDate]);

  const latestReviewLabel = useMemo(() => {
    if (!latestReviewDate) {
      return null;
    }

    return latestReviewDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }, [latestReviewDate]);

  const daysSinceLastReview = useMemo(() => {
    if (!latestReviewDate) {
      return null;
    }

    return Math.max(0, Math.round((Date.now() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24)));
  }, [latestReviewDate]);

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

  const renderHero = () => (
    <ExperienceCommandCenter
      data={filteredData}
      filters={filters}
      onFilterToggle={onFilterToggle}
      isFilterOpen={isFilterOpen}
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearAllFilters}
      onRefresh={refresh}
      loading={loading}
      onQuickFilter={handleQuickFilter}
      hasRecentData={hasRecentData}
      latestReviewDate={latestReviewDate}
      renderExport={() => <ExportTools data={filteredData} filters={filters} />}
    />
  );

  // Loading state
  if (loading) {
    return (
      <Box py={{ base: 4, md: 6 }} bg={bgColor} minH="100vh">
        <VStack spacing={8} align="stretch">
          {renderHero()}
          <Box px={{ base: 4, md: 6 }}>
            <AnalyticsSkeleton />
          </Box>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box py={{ base: 4, md: 6 }} bg={bgColor} minH="100vh">
        <VStack spacing={8} align="stretch">
          {renderHero()}
          <Box px={{ base: 4, md: 6 }}>
            <Alert status="error" rounded="lg" alignItems="flex-start">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ошибка загрузки аналитических данных</Text>
                <Text fontSize="sm">{error}</Text>
              </Box>
              <Button ml="auto" size="sm" onClick={refresh} variant="outline" colorScheme="brand">
                Повторить загрузку
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
      <Box py={{ base: 4, md: 6 }} bg={bgColor} minH="100vh">
        <VStack spacing={8} align="stretch">
          {renderHero()}
          <Center py={12}>
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                Нет данных для аналитики
              </Text>
              <Text fontSize="sm" color="gray.500">
                Попробуйте изменить фильтры или обновить страницу
              </Text>
            </VStack>
          </Center>
        </VStack>
      </Box>
    );
  }

  return (
    <Box py={{ base: 4, md: 6 }} bg={bgColor} minH="100vh">
      <VStack spacing={8} align="stretch">
        {renderHero()}

        {!hasRecentData && filteredData.length > 0 && (
          <Box px={{ base: 4, md: 6 }}>
            <Alert status="info" variant="left-accent" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Работа с историческими данными</Text>
                <Text fontSize="sm">
                  Последний найденный отзыв: {latestReviewLabel || "ранее"}
                  {typeof daysSinceLastReview === "number" ? ` (${daysSinceLastReview} дн. назад)` : ""}. Модули, ориентированные на live-сигналы, временно отключены.
                </Text>
              </Box>
            </Alert>
          </Box>
        )}

        <Box px={{ base: 4, md: 6 }}>
          <Collapse in={isFilterOpen} animateOpacity>
            <FilterPanel filters={filters} onFiltersChange={setFilters} data={combinedData} />
          </Collapse>
        </Box>

        <Box px={{ base: 4, md: 6 }}>
          <VStack spacing={10} align="stretch">
            {hasRecentData && <ExperiencePulse data={filteredData} hasRecentData={hasRecentData} />}
            <AdvancedKPI data={filteredData} />
            {hasRecentData && (
              <BreakoutInsights
                data={filteredData}
                onQuickFilter={handleQuickFilter}
                hasRecentData={hasRecentData}
              />
            )}
            <CustomerSpotlights
              data={filteredData}
              onQuickFilter={handleQuickFilter}
              hasRecentData={hasRecentData}
              latestReviewDate={latestReviewDate}
            />
            <SmartInsights data={filteredData} />
            <VStack spacing={6} align="stretch">
              <SentimentAnalysis data={filteredData} onQuickFilter={handleQuickFilter} />
              <TopicsInsights data={filteredData} onQuickFilter={handleQuickFilter} />
            </VStack>
            <AdvancedTimelines data={filteredData} />
            <GeographicInsights data={filteredData} onQuickFilter={handleQuickFilter} />
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
              <WordCloudAnalysis data={filteredData} />
              <ActivityHeatMap data={filteredData} />
            </SimpleGrid>
            <ReviewsTable reviews={filteredData} />
          </VStack>
        </Box>

        {hasRecentData && (
          <Box px={{ base: 4, md: 6 }}>
            <LiveAlerts data={filteredData} />
          </Box>
        )}
      </VStack>
    </Box>
  );
}
