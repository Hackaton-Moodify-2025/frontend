import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    Progress,
    useColorModeValue,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Icon
} from "@chakra-ui/react";
import { FiMessageSquare, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";

export default function TopicsInsights({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Подсчет по темам
    const topicStats = {};
    data.forEach(review => {
        review.topics?.forEach((topic, index) => {
            if (!topicStats[topic]) {
                topicStats[topic] = {
                    count: 0,
                    positive: 0,
                    negative: 0,
                    neutral: 0
                };
            }
            topicStats[topic].count++;

            const sentiment = review.sentiments?.[index];
            if (sentiment === "положительно") topicStats[topic].positive++;
            else if (sentiment === "отрицательно") topicStats[topic].negative++;
            else topicStats[topic].neutral++;
        });
    });

    // Сортировка тем по количеству упоминаний
    const sortedTopics = Object.entries(topicStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 6);

    // Самая проблемная тема
    const mostProblematicTopic = Object.entries(topicStats)
        .map(([topic, stats]) => ({
            topic,
            negativePercent: (stats.negative / stats.count * 100),
            count: stats.count
        }))
        .filter(item => item.count >= 5) // Только темы с достаточным количеством отзывов
        .sort((a, b) => b.negativePercent - a.negativePercent)[0];

    const getTopicColor = (stats) => {
        const negativePercent = (stats.negative / stats.count * 100);
        if (negativePercent > 60) return "red";
        if (negativePercent > 40) return "orange";
        if (stats.positive / stats.count > 0.6) return "green";
        return "blue";
    };

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
                <Text fontSize="lg" fontWeight="bold" color="brand.500">
                    Анализ тем и инсайты
                </Text>

                {/* Топ статистика */}
                <SimpleGrid columns={3} spacing={4}>
                    <Stat>
                        <StatLabel fontSize="xs">Всего тем</StatLabel>
                        <StatNumber fontSize="2xl" color="brand.500">
                            {Object.keys(topicStats).length}
                        </StatNumber>
                        <StatHelpText>активных тем</StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs">Самая обсуждаемая</StatLabel>
                        <StatNumber fontSize="sm" color="blue.500">
                            {sortedTopics[0]?.[0] || "Нет данных"}
                        </StatNumber>
                        <StatHelpText>{sortedTopics[0]?.[1]?.count || 0} упоминаний</StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs">Требует внимания</StatLabel>
                        <StatNumber fontSize="sm" color="red.500">
                            {mostProblematicTopic?.topic || "Нет данных"}
                        </StatNumber>
                        <StatHelpText>
                            {mostProblematicTopic ? `${mostProblematicTopic.negativePercent.toFixed(1)}% негатива` : ""}
                        </StatHelpText>
                    </Stat>
                </SimpleGrid>

                {/* Детализация по темам */}
                <VStack align="stretch" spacing={4}>
                    {sortedTopics.map(([topic, stats]) => {
                        const negativePercent = (stats.negative / stats.count * 100).toFixed(1);
                        const positivePercent = (stats.positive / stats.count * 100).toFixed(1);

                        return (
                            <Box key={topic}>
                                <HStack justify="space-between" mb={2}>
                                    <HStack>
                                        <Icon as={FiMessageSquare} color="brand.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="semibold">
                                            {topic}
                                        </Text>
                                        {negativePercent > 50 && (
                                            <Icon as={FiAlertTriangle} color="red.500" boxSize={4} />
                                        )}
                                    </HStack>
                                    <HStack spacing={2}>
                                        <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                            {positivePercent}% 👍
                                        </Badge>
                                        <Badge colorScheme="red" variant="subtle" fontSize="xs">
                                            {negativePercent}% 👎
                                        </Badge>
                                        <Badge colorScheme={getTopicColor(stats)} variant="outline" fontSize="xs">
                                            {stats.count}
                                        </Badge>
                                    </HStack>
                                </HStack>

                                <Progress
                                    value={100}
                                    size="sm"
                                    borderRadius="full"
                                    bg="red.100"
                                >
                                    <Box
                                        h="100%"
                                        w={`${positivePercent}%`}
                                        bg="green.400"
                                        borderRadius="full"
                                    />
                                </Progress>
                            </Box>
                        );
                    })}
                </VStack>

                {/* Рекомендации */}
                {mostProblematicTopic && mostProblematicTopic.negativePercent > 60 && (
                    <Box mt={4} p={4} bg="red.50" borderRadius="lg" border="1px" borderColor="red.200">
                        <HStack>
                            <Icon as={FiAlertTriangle} color="red.500" />
                            <Text fontSize="sm" fontWeight="bold" color="red.700">
                                Критическая проблема: {mostProblematicTopic.topic}
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color="red.600" mt={1}>
                            {mostProblematicTopic.negativePercent.toFixed(1)}% негативных отзывов требует немедленного внимания
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}