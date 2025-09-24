import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import KpiCards from "../components/KpiCards.jsx";
// import GeoMap from "../components/GeoMap.jsx";
import SentimentPie from "../components/SentimentPie.jsx";
import TopicsBarChart from "../components/TopicsBarChart.jsx";
import ReviewsTimeline from "../components/ReviewsTimeline.jsx";

export default function AnalyticsDashboard() {
  // Мокушные данные
  const stats = [
    { label: "Всего отзывов", value: 1001 },
    { label: "Позитивные", value: 400, color: "green.500" },
    { label: "Нейтральные", value: 300, color: "gray.500" },
    { label: "Негативные", value: 301, color: "red.500" },
  ];

  const sentimentData = [
    { name: "Позитивные", value: 400 },
    { name: "Нейтральные", value: 300 },
    { name: "Негативные", value: 301 },
  ];

  const topicsData = [
    { topic: "Карты", count: 250 },
    { topic: "Отделения", count: 180 },
    { topic: "Ипотека", count: 120 },
    { topic: "Поддержка", count: 210 },
  ];

  const timelineData = [
    { date: "2025-09-20", reviews: 120 },
    { date: "2025-09-21", reviews: 180 },
    { date: "2025-09-22", reviews: 90 },
    { date: "2025-09-23", reviews: 200 },
  ];

  // гео чуть позже добавим

  const cities = [
    { name: "Москва", coords: [37.6173, 55.7558], count: 120, positive: 80, negative: 40 },
    { name: "Екатеринбург", coords: [60.5975, 56.8389], count: 50, positive: 20, negative: 30 },
  ];

  return (
    <Box py={6}>
      <Heading mb={6} color="brand.500">
        Аналитический дашборд
      </Heading>

      <KpiCards stats={stats} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <SentimentPie data={sentimentData} />
        <TopicsBarChart data={topicsData} />
      </SimpleGrid>

      <ReviewsTimeline data={timelineData} />

      {/* <Box mt={6}>
        <GeoMap cities={cities} />
      </Box> */}
    </Box>
  );
}
