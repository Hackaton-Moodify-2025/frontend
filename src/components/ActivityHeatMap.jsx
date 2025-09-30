import {
    Box,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip,
    Select,
    Grid,
    GridItem
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FiCalendar, FiActivity, FiClock } from "react-icons/fi";

export default function ActivityHeatMap({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const [viewMode, setViewMode] = useState("month"); // month, week, hour
    const [metricType, setMetricType] = useState("volume"); // volume, sentiment

    // Обработка данных для тепловой карты
    const heatMapData = useMemo(() => {
        if (viewMode === "month") {
            // Анализ по дням месяца
            const monthlyData = {};

            data.forEach(review => {
                if (!review.date) return;

                try {
                    const date = new Date(review.date);
                    const dayOfMonth = date.getDate();
                    const key = `day_${dayOfMonth}`;

                    if (!monthlyData[key]) {
                        monthlyData[key] = {
                            day: dayOfMonth,
                            total: 0,
                            positive: 0,
                            negative: 0,
                            neutral: 0
                        };
                    }

                    monthlyData[key].total++;

                    if (review.sentiments?.includes("положительно")) monthlyData[key].positive++;
                    else if (review.sentiments?.includes("отрицательно")) monthlyData[key].negative++;
                    else monthlyData[key].neutral++;

                } catch (e) {
                    // Игнорируем неверные даты
                }
            });

            return Object.values(monthlyData).sort((a, b) => a.day - b.day);

        } else if (viewMode === "week") {
            // Анализ по дням недели
            const weekdays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
            const weeklyData = weekdays.map((name, index) => ({
                day: index,
                name,
                total: 0,
                positive: 0,
                negative: 0,
                neutral: 0
            }));

            data.forEach(review => {
                if (!review.date) return;

                try {
                    const date = new Date(review.date);
                    const dayOfWeek = (date.getDay() + 6) % 7; // Понедельник = 0

                    weeklyData[dayOfWeek].total++;

                    if (review.sentiments?.includes("положительно")) weeklyData[dayOfWeek].positive++;
                    else if (review.sentiments?.includes("отрицательно")) weeklyData[dayOfWeek].negative++;
                    else weeklyData[dayOfWeek].neutral++;

                } catch (e) {
                    // Игнорируем неверные даты
                }
            });

            return weeklyData;

        } else {
            // Анализ по часам (имитация)
            const hourlyData = [];
            for (let hour = 0; hour < 24; hour++) {
                const randomActivity = Math.floor(Math.random() * 50) + (hour >= 9 && hour <= 18 ? 20 : 5);
                const positiveRate = 0.4 + Math.random() * 0.4; // 40-80%

                hourlyData.push({
                    hour,
                    name: `${hour}:00`,
                    total: randomActivity,
                    positive: Math.floor(randomActivity * positiveRate),
                    negative: Math.floor(randomActivity * (1 - positiveRate) * 0.7),
                    neutral: randomActivity - Math.floor(randomActivity * positiveRate) - Math.floor(randomActivity * (1 - positiveRate) * 0.7)
                });
            }

            return hourlyData;
        }
    }, [data, viewMode]);

    // Максимальные значения для нормализации
    const maxValues = useMemo(() => {
        const maxTotal = Math.max(...heatMapData.map(d => d.total), 1);
        const maxPositive = Math.max(...heatMapData.map(d => d.positive), 1);
        const maxNegative = Math.max(...heatMapData.map(d => d.negative), 1);

        return { maxTotal, maxPositive, maxNegative };
    }, [heatMapData]);

    // Функция получения цвета ячейки
    const getCellColor = (item) => {
        if (metricType === "volume") {
            const intensity = item.total / maxValues.maxTotal;
            return intensity > 0.8 ? "brand.600" :
                intensity > 0.6 ? "brand.500" :
                    intensity > 0.4 ? "brand.400" :
                        intensity > 0.2 ? "brand.300" : "brand.100";
        } else {
            const positivityRate = item.total > 0 ? item.positive / item.total : 0;
            return positivityRate > 0.7 ? "green.500" :
                positivityRate > 0.5 ? "green.400" :
                    positivityRate > 0.3 ? "yellow.400" :
                        positivityRate > 0.1 ? "orange.400" : "red.400";
        }
    };

    // Функция получения интенсивности
    const getCellOpacity = (item) => {
        if (metricType === "volume") {
            return Math.max(0.3, item.total / maxValues.maxTotal);
        } else {
            return Math.max(0.3, item.total / maxValues.maxTotal);
        }
    };

    const getViewTitle = () => {
        switch (viewMode) {
            case "month": return "Активность по дням месяца";
            case "week": return "Активность по дням недели";
            case "hour": return "Активность по часам (имитация)";
            default: return "Тепловая карта активности";
        }
    };

    const getMetricTitle = () => {
        switch (metricType) {
            case "volume": return "Объем отзывов";
            case "sentiment": return "Настроение клиентов";
            default: return "Метрика";
        }
    };

    // Статистика
    const totalActivity = heatMapData.reduce((sum, item) => sum + item.total, 0);
    const avgActivity = heatMapData.length > 0 ? totalActivity / heatMapData.length : 0;
    const peakActivity = Math.max(...heatMapData.map(d => d.total));
    const peakPeriod = heatMapData.find(d => d.total === peakActivity);

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
                        <Icon as={FiActivity} color="brand.500" boxSize={5} />
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Тепловая карта активности
                        </Text>
                    </HStack>
                    <HStack spacing={3}>
                        <Select
                            size="sm"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            w="180px"
                        >
                            <option value="month">По дням месяца</option>
                            <option value="week">По дням недели</option>
                            <option value="hour">По часам дня</option>
                        </Select>
                        <Select
                            size="sm"
                            value={metricType}
                            onChange={(e) => setMetricType(e.target.value)}
                            w="160px"
                        >
                            <option value="volume">Объем</option>
                            <option value="sentiment">Настроение</option>
                        </Select>
                    </HStack>
                </HStack>

                {/* Статистика */}
                <SimpleGrid columns={4} spacing={4}>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="brand.500">
                            {totalActivity}
                        </Text>
                        <Text fontSize="sm" color="gray.600">всего активности</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="green.500">
                            {avgActivity.toFixed(1)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">средняя активность</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="orange.500">
                            {peakActivity}
                        </Text>
                        <Text fontSize="sm" color="gray.600">пиковая активность</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="purple.500">
                            {peakPeriod?.name || peakPeriod?.day || "—"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">пиковый период</Text>
                    </Box>
                </SimpleGrid>

                {/* Легенда */}
                <HStack justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="semibold">
                        {getViewTitle()} - {getMetricTitle()}
                    </Text>
                    <HStack spacing={2}>
                        <Text fontSize="xs">Низкая</Text>
                        <HStack spacing={1}>
                            {[0.2, 0.4, 0.6, 0.8, 1.0].map(intensity => (
                                <Box
                                    key={intensity}
                                    w="15px"
                                    h="15px"
                                    bg={metricType === "volume" ?
                                        `brand.${intensity > 0.8 ? "600" : intensity > 0.6 ? "500" : intensity > 0.4 ? "400" : intensity > 0.2 ? "300" : "100"}` :
                                        intensity > 0.8 ? "green.500" : intensity > 0.6 ? "green.400" : intensity > 0.4 ? "yellow.400" : intensity > 0.2 ? "orange.400" : "red.400"
                                    }
                                    borderRadius="sm"
                                    opacity={intensity}
                                />
                            ))}
                        </HStack>
                        <Text fontSize="xs">Высокая</Text>
                    </HStack>
                </HStack>

                {/* Тепловая карта */}
                <Box>
                    <Grid
                        templateColumns={
                            viewMode === "month" ? "repeat(7, 1fr)" :
                                viewMode === "week" ? "repeat(7, 1fr)" :
                                    "repeat(6, 1fr)"
                        }
                        gap={2}
                    >
                        {heatMapData.map((item, index) => (
                            <GridItem key={index}>
                                <Tooltip
                                    label={
                                        <VStack spacing={1} align="start">
                                            <Text fontSize="sm" fontWeight="bold">
                                                {item.name || `День ${item.day}` || `Час ${item.hour}`}
                                            </Text>
                                            <Text fontSize="xs">Всего: {item.total}</Text>
                                            <Text fontSize="xs" color="green.300">Позитивные: {item.positive}</Text>
                                            <Text fontSize="xs" color="red.300">Негативные: {item.negative}</Text>
                                            <Text fontSize="xs" color="gray.300">Нейтральные: {item.neutral}</Text>
                                            {metricType === "sentiment" && item.total > 0 && (
                                                <Text fontSize="xs">
                                                    Позитивность: {((item.positive / item.total) * 100).toFixed(1)}%
                                                </Text>
                                            )}
                                        </VStack>
                                    }
                                    placement="top"
                                    hasArrow
                                >
                                    <Box
                                        w="100%"
                                        h={viewMode === "hour" ? "40px" : "60px"}
                                        bg={getCellColor(item)}
                                        opacity={getCellOpacity(item)}
                                        borderRadius="md"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        cursor="help"
                                        border="1px"
                                        borderColor="gray.200"
                                        _hover={{
                                            transform: "scale(1.05)",
                                            shadow: "md",
                                            opacity: 1
                                        }}
                                        transition="all 0.2s"
                                    >
                                        <VStack spacing={0}>
                                            <Text fontSize="xs" fontWeight="bold" color="white" textShadow="1px 1px 1px rgba(0,0,0,0.5)">
                                                {item.name?.split('').slice(0, 3).join('') || item.day || item.hour}
                                            </Text>
                                            <Text fontSize="xs" color="white" textShadow="1px 1px 1px rgba(0,0,0,0.5)">
                                                {item.total}
                                            </Text>
                                        </VStack>
                                    </Box>
                                </Tooltip>
                            </GridItem>
                        ))}
                    </Grid>
                </Box>

                {/* Инсайты */}
                <Box p={4} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
                    <Text fontSize="sm" fontWeight="bold" color="purple.700" mb={1}>
                        📈 Анализ временных паттернов
                    </Text>
                    <Text fontSize="xs" color="purple.600">
                        {viewMode === "week" && (
                            <>Наиболее активный день недели: <strong>{peakPeriod?.name}</strong> ({peakActivity} отзывов). </>
                        )}
                        {viewMode === "month" && (
                            <>Пик активности приходится на <strong>{peakPeriod?.day} число</strong> месяца. </>
                        )}
                        {viewMode === "hour" && (
                            <>Максимальная активность в <strong>{peakPeriod?.name}</strong>. </>
                        )}
                        Средняя активность составляет {avgActivity.toFixed(1)} отзывов за период.
                        {metricType === "sentiment" && (
                            <> Рекомендуется анализировать негативные периоды для выявления системных проблем.</>
                        )}
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
}