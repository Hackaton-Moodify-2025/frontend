import {
    Box,
    Text,
    VStack,
    HStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Badge,
    Button,
    Icon,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Progress,
    Divider,
    List,
    ListItem,
    ListIcon
} from "@chakra-ui/react";
import {
    FiTrendingUp,
    FiTrendingDown,
    FiAlertTriangle,
    FiCheckCircle,
    FiTarget,
    FiUsers,
    FiMessageCircle,
    FiMapPin,
    FiClock
} from "react-icons/fi";

export default function SmartInsights({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Анализ данных для генерации инсайтов
    const generateInsights = () => {
        const insights = [];

        // Общая статистика
        const totalReviews = data.length;
        const positiveReviews = data.filter(r => r.sentiments?.includes("положительно")).length;
        const negativeReviews = data.filter(r => r.sentiments?.includes("отрицательно")).length;

        const positivityRate = totalReviews > 0 ? (positiveReviews / totalReviews * 100) : 0;
        const negativityRate = totalReviews > 0 ? (negativeReviews / totalReviews * 100) : 0;

        // Анализ тем
        const topicsStats = {};
        data.forEach(review => {
            review.topics?.forEach((topic, index) => {
                if (!topicsStats[topic]) {
                    topicsStats[topic] = { total: 0, positive: 0, negative: 0 };
                }
                topicsStats[topic].total++;

                const sentiment = review.sentiments?.[index];
                if (sentiment === "положительно") topicsStats[topic].positive++;
                if (sentiment === "отрицательно") topicsStats[topic].negative++;
            });
        });

        const problematicTopics = Object.entries(topicsStats)
            .filter(([, stats]) => stats.total >= 5)
            .map(([topic, stats]) => ({
                topic,
                negativeRate: (stats.negative / stats.total * 100),
                total: stats.total
            }))
            .filter(item => item.negativeRate > 60)
            .sort((a, b) => b.negativeRate - a.negativeRate);

        const strongTopics = Object.entries(topicsStats)
            .filter(([, stats]) => stats.total >= 5)
            .map(([topic, stats]) => ({
                topic,
                positiveRate: (stats.positive / stats.total * 100),
                total: stats.total
            }))
            .filter(item => item.positiveRate > 70)
            .sort((a, b) => b.positiveRate - a.positiveRate);

        // Рейтинги
        const validRatings = data.map(r => parseInt(r.rating)).filter(r => !isNaN(r) && r > 0);
        const avgRating = validRatings.length > 0
            ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
            : 0;

        // Города
        const cityStats = {};
        data.forEach(review => {
            const city = review.city || "Неизвестно";
            if (!cityStats[city]) {
                cityStats[city] = { total: 0, positive: 0, negative: 0 };
            }
            cityStats[city].total++;
            if (review.sentiments?.includes("положительно")) cityStats[city].positive++;
            if (review.sentiments?.includes("отрицательно")) cityStats[city].negative++;
        });

        const bestCities = Object.entries(cityStats)
            .filter(([, stats]) => stats.total >= 3)
            .map(([city, stats]) => ({
                city,
                positiveRate: (stats.positive / stats.total * 100),
                total: stats.total
            }))
            .sort((a, b) => b.positiveRate - a.positiveRate);

        // Генерация инсайтов

        // 1. Общее состояние
        if (positivityRate > 60) {
            insights.push({
                type: "success",
                title: "Отличные результаты!",
                description: `${positivityRate.toFixed(1)}% положительных отзывов - это превосходный показатель`,
                priority: "high",
                category: "general"
            });
        } else if (negativityRate > 50) {
            insights.push({
                type: "error",
                title: "Критическая ситуация",
                description: `${negativityRate.toFixed(1)}% негативных отзывов требует немедленного внимания`,
                priority: "critical",
                category: "general"
            });
        } else if (negativityRate > 30) {
            insights.push({
                type: "warning",
                title: "Требуется улучшение",
                description: `${negativityRate.toFixed(1)}% негативных отзывов - выше нормы`,
                priority: "medium",
                category: "general"
            });
        }

        // 2. Проблемные темы
        if (problematicTopics.length > 0) {
            const worstTopic = problematicTopics[0];
            insights.push({
                type: "error",
                title: `Проблема с "${worstTopic.topic}"`,
                description: `${worstTopic.negativeRate.toFixed(1)}% негативных отзывов по этой теме из ${worstTopic.total} упоминаний`,
                priority: "high",
                category: "topics",
                action: `Рекомендуется срочно изучить жалобы по теме "${worstTopic.topic}"`
            });
        }

        // 3. Сильные стороны
        if (strongTopics.length > 0) {
            const bestTopic = strongTopics[0];
            insights.push({
                type: "success",
                title: `Отличная работа: "${bestTopic.topic}"`,
                description: `${bestTopic.positiveRate.toFixed(1)}% положительных отзывов - используйте этот опыт для других направлений`,
                priority: "medium",
                category: "topics"
            });
        }

        // 4. Рейтинг
        if (avgRating < 2.5) {
            insights.push({
                type: "error",
                title: "Низкий средний рейтинг",
                description: `Средний рейтинг ${avgRating.toFixed(1)} из 5 - критически низкий показатель`,
                priority: "critical",
                category: "rating"
            });
        } else if (avgRating > 4) {
            insights.push({
                type: "success",
                title: "Высокий рейтинг клиентов",
                description: `Средний рейтинг ${avgRating.toFixed(1)} из 5 - отличный результат!`,
                priority: "low",
                category: "rating"
            });
        }

        // 5. Региональные особенности
        if (bestCities.length > 1) {
            const bestCity = bestCities[0];
            const worstCity = bestCities[bestCities.length - 1];

            if (bestCity.positiveRate - worstCity.positiveRate > 30) {
                insights.push({
                    type: "info",
                    title: "Региональные различия",
                    description: `Большая разница в показателях: ${bestCity.city} (${bestCity.positiveRate.toFixed(1)}%) vs ${worstCity.city} (${worstCity.positiveRate.toFixed(1)}%)`,
                    priority: "medium",
                    category: "geography",
                    action: `Изучить успешный опыт ${bestCity.city} для применения в ${worstCity.city}`
                });
            }
        }

        // 6. Объем данных
        if (totalReviews < 50) {
            insights.push({
                type: "warning",
                title: "Недостаточно данных",
                description: `Всего ${totalReviews} отзывов. Для более точной аналитики рекомендуется увеличить выборку`,
                priority: "low",
                category: "data"
            });
        }

        return insights.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    };

    const insights = generateInsights();

    const getAlertStatus = (type) => {
        switch (type) {
            case "success": return "success";
            case "error": return "error";
            case "warning": return "warning";
            default: return "info";
        }
    };

    const getIcon = (category) => {
        switch (category) {
            case "topics": return FiMessageCircle;
            case "geography": return FiMapPin;
            case "rating": return FiTarget;
            case "general": return FiUsers;
            case "data": return FiClock;
            default: return FiCheckCircle;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical": return "red";
            case "high": return "orange";
            case "medium": return "yellow";
            case "low": return "blue";
            default: return "gray";
        }
    };

    const getCategoryName = (category) => {
        switch (category) {
            case "topics": return "Тематика";
            case "geography": return "География";
            case "rating": return "Рейтинг";
            case "general": return "Общее";
            case "data": return "Данные";
            default: return "Другое";
        }
    };

    // Группировка по категориям
    const groupedInsights = insights.reduce((acc, insight) => {
        if (!acc[insight.category]) {
            acc[insight.category] = [];
        }
        acc[insight.category].push(insight);
        return acc;
    }, {});

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
                <HStack justify="space-between">
                    <HStack>
                        <Icon as={FiTrendingUp} color="brand.500" boxSize={5} />
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Умные инсайты и рекомендации
                        </Text>
                    </HStack>
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        {insights.length} инсайтов
                    </Badge>
                </HStack>

                {insights.length === 0 ? (
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <AlertDescription>
                            Недостаточно данных для генерации инсайтов. Попробуйте изменить фильтры.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Accordion allowMultiple>
                        {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
                            <AccordionItem key={category} border="none">
                                <AccordionButton
                                    p={4}
                                    borderRadius="lg"
                                    bg={useColorModeValue("gray.50", "gray.700")}
                                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                    mb={2}
                                >
                                    <HStack flex="1" textAlign="left" spacing={3}>
                                        <Icon as={getIcon(category)} color="brand.500" />
                                        <Text fontWeight="semibold">
                                            {getCategoryName(category)}
                                        </Text>
                                        <Badge size="sm" colorScheme="brand" variant="subtle">
                                            {categoryInsights.length}
                                        </Badge>
                                    </HStack>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                    <VStack spacing={3} align="stretch">
                                        {categoryInsights.map((insight, index) => (
                                            <Alert
                                                key={index}
                                                status={getAlertStatus(insight.type)}
                                                borderRadius="lg"
                                                flexDirection="column"
                                                alignItems="start"
                                            >
                                                <HStack w="100%" justify="space-between">
                                                    <HStack>
                                                        <AlertIcon />
                                                        <AlertTitle fontSize="sm">
                                                            {insight.title}
                                                        </AlertTitle>
                                                    </HStack>
                                                    <Badge
                                                        colorScheme={getPriorityColor(insight.priority)}
                                                        variant="solid"
                                                        fontSize="xs"
                                                    >
                                                        {insight.priority}
                                                    </Badge>
                                                </HStack>
                                                <AlertDescription fontSize="sm" mt={2}>
                                                    {insight.description}
                                                </AlertDescription>
                                                {insight.action && (
                                                    <Box mt={2} w="100%">
                                                        <Divider my={2} />
                                                        <HStack>
                                                            <Icon as={FiTarget} color="blue.500" boxSize={4} />
                                                            <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                                                                Рекомендация: {insight.action}
                                                            </Text>
                                                        </HStack>
                                                    </Box>
                                                )}
                                            </Alert>
                                        ))}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                {/* Сводка рекомендаций */}
                {insights.length > 0 && (
                    <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                        <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
                            🎯 Ключевые действия
                        </Text>
                        <List spacing={1}>
                            {insights
                                .filter(i => i.action)
                                .slice(0, 3)
                                .map((insight, index) => (
                                    <ListItem key={index} fontSize="xs" color="blue.600">
                                        <ListIcon as={FiCheckCircle} color="blue.500" />
                                        {insight.action}
                                    </ListItem>
                                ))}
                        </List>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}