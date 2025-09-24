import {
    Box,
    Text,
    VStack,
    HStack,
    Select,
    SimpleGrid,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { FiCalendar, FiTrendingUp, FiActivity } from "react-icons/fi";

export default function AdvancedTimelines({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const [viewType, setViewType] = useState("sentiment");
    const [timeframe, setTimeframe] = useState("30"); // дни

    // Обработка данных по времени
    const processTimelineData = useMemo(() => {
        // Группировка по датам
        const dateGroups = {};

        data.forEach(review => {
            if (!review.date) return;

            const date = new Date(review.date);
            if (isNaN(date.getTime())) return;

            const dateKey = date.toISOString().split('T')[0];

            if (!dateGroups[dateKey]) {
                dateGroups[dateKey] = {
                    date: dateKey,
                    total: 0,
                    positive: 0,
                    negative: 0,
                    neutral: 0,
                    avgRating: 0,
                    ratings: [],
                    topics: {}
                };
            }

            const group = dateGroups[dateKey];
            group.total++;

            // Настроения
            if (review.sentiments?.includes("положительно")) group.positive++;
            if (review.sentiments?.includes("отрицательно")) group.negative++;
            if (review.sentiments?.includes("нейтрально")) group.neutral++;

            // Рейтинги
            const rating = parseInt(review.rating);
            if (!isNaN(rating) && rating > 0) {
                group.ratings.push(rating);
            }

            // Темы
            review.topics?.forEach(topic => {
                group.topics[topic] = (group.topics[topic] || 0) + 1;
            });
        });

        // Вычисляем средние рейтинги и сортируем по дате
        const timeline = Object.values(dateGroups)
            .map(group => ({
                ...group,
                avgRating: group.ratings.length > 0
                    ? (group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length).toFixed(1)
                    : 0,
                positivePercent: (group.positive / group.total * 100).toFixed(1),
                negativePercent: (group.negative / group.total * 100).toFixed(1),
                topTopic: Object.entries(group.topics).sort(([, a], [, b]) => b - a)[0]?.[0] || "Нет данных"
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-parseInt(timeframe)); // Показываем только последние N дней

        return timeline;
    }, [data, timeframe]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Компонент для отображения разных типов графиков
    const renderChart = () => {
        const commonProps = {
            width: "100%",
            height: 300,
            data: processTimelineData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (viewType) {
            case "sentiment":
                return (
                    <ResponsiveContainer {...commonProps}>
                        <AreaChart data={processTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                            />
                            <YAxis fontSize={12} />
                            <RechartsTooltip
                                labelFormatter={(value) => formatDate(value)}
                                formatter={(value, name) => [value, name === 'positive' ? 'Позитивные' : name === 'negative' ? 'Негативные' : 'Нейтральные']}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="positive"
                                stackId="1"
                                stroke="#38A169"
                                fill="#38A169"
                                fillOpacity={0.6}
                                name="Позитивные"
                            />
                            <Area
                                type="monotone"
                                dataKey="neutral"
                                stackId="1"
                                stroke="#718096"
                                fill="#718096"
                                fillOpacity={0.6}
                                name="Нейтральные"
                            />
                            <Area
                                type="monotone"
                                dataKey="negative"
                                stackId="1"
                                stroke="#E53E3E"
                                fill="#E53E3E"
                                fillOpacity={0.6}
                                name="Негативные"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case "rating":
                return (
                    <ResponsiveContainer {...commonProps}>
                        <LineChart data={processTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                            />
                            <YAxis domain={[1, 5]} fontSize={12} />
                            <RechartsTooltip
                                labelFormatter={(value) => formatDate(value)}
                                formatter={(value) => [value, 'Средний рейтинг']}
                            />
                            <Line
                                type="monotone"
                                dataKey="avgRating"
                                stroke="#3182CE"
                                strokeWidth={3}
                                dot={{ fill: '#3182CE', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case "volume":
                return (
                    <ResponsiveContainer {...commonProps}>
                        <BarChart data={processTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                fontSize={12}
                            />
                            <YAxis fontSize={12} />
                            <RechartsTooltip
                                labelFormatter={(value) => formatDate(value)}
                                formatter={(value) => [value, 'Количество отзывов']}
                            />
                            <Bar
                                dataKey="total"
                                fill="#805AD5"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    // Статистика за период
    const periodStats = useMemo(() => {
        const total = processTimelineData.reduce((sum, day) => sum + day.total, 0);
        const totalPositive = processTimelineData.reduce((sum, day) => sum + day.positive, 0);
        const totalNegative = processTimelineData.reduce((sum, day) => sum + day.negative, 0);
        const avgRatingPeriod = processTimelineData.length > 0
            ? (processTimelineData.reduce((sum, day) => sum + parseFloat(day.avgRating || 0), 0) / processTimelineData.length).toFixed(1)
            : 0;

        return {
            total,
            positivePercent: total > 0 ? ((totalPositive / total) * 100).toFixed(1) : 0,
            negativePercent: total > 0 ? ((totalNegative / total) * 100).toFixed(1) : 0,
            avgRating: avgRatingPeriod,
            trend: processTimelineData.length > 1
                ? (processTimelineData[processTimelineData.length - 1].total - processTimelineData[0].total) > 0 ? "up" : "down"
                : "neutral"
        };
    }, [processTimelineData]);

    return (
        <Box
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            shadow="lg"
        >
            <VStack align="stretch" spacing={6}>
                {/* Заголовок и контролы */}
                <HStack justify="space-between">
                    <HStack>
                        <Icon as={FiCalendar} color="brand.500" />
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Временные тренды
                        </Text>
                    </HStack>
                    <HStack spacing={3}>
                        <Select size="sm" value={viewType} onChange={(e) => setViewType(e.target.value)}>
                            <option value="sentiment">Настроения</option>
                            <option value="rating">Рейтинги</option>
                            <option value="volume">Объем отзывов</option>
                        </Select>
                        <Select size="sm" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="7">7 дней</option>
                            <option value="14">2 недели</option>
                            <option value="30">30 дней</option>
                            <option value="90">3 месяца</option>
                        </Select>
                    </HStack>
                </HStack>

                {/* Статистика за период */}
                <SimpleGrid columns={4} spacing={4}>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="brand.500">
                            {periodStats.total}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                            отзывов за период
                        </Text>
                        {periodStats.trend !== "neutral" && (
                            <Icon
                                as={FiTrendingUp}
                                color={periodStats.trend === "up" ? "green.500" : "red.500"}
                                transform={periodStats.trend === "down" ? "rotate(180deg)" : "none"}
                            />
                        )}
                    </Box>

                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="green.500">
                            {periodStats.positivePercent}%
                        </Text>
                        <Text fontSize="xs" color="gray.600">позитивных</Text>
                    </Box>

                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="red.500">
                            {periodStats.negativePercent}%
                        </Text>
                        <Text fontSize="xs" color="gray.600">негативных</Text>
                    </Box>

                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="yellow.500">
                            {periodStats.avgRating}⭐
                        </Text>
                        <Text fontSize="xs" color="gray.600">средний рейтинг</Text>
                    </Box>
                </SimpleGrid>

                {/* График */}
                <Box minH="300px">
                    {processTimelineData.length > 0 ? (
                        renderChart()
                    ) : (
                        <Box
                            height="300px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="gray.500"
                        >
                            <VStack>
                                <Icon as={FiActivity} boxSize={8} />
                                <Text>Нет данных для отображения</Text>
                            </VStack>
                        </Box>
                    )}
                </Box>

                {/* Инсайты */}
                {processTimelineData.length > 0 && (
                    <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                        <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={1}>
                            📊 Анализ тренда за {timeframe} дней
                        </Text>
                        <Text fontSize="xs" color="blue.600">
                            {periodStats.trend === "up" ?
                                `Активность растет! Количество отзывов увеличивается. ` :
                                periodStats.trend === "down" ?
                                    `Снижение активности. Стоит проанализировать причины. ` :
                                    `Стабильная активность. `
                            }
                            Позитивность составляет {periodStats.positivePercent}%, что {
                                parseFloat(periodStats.positivePercent) > 50 ? "выше" : "ниже"
                            } среднего уровня.
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}