import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Icon,
    Button,
    ButtonGroup,
    Wrap,
    WrapItem,
    Tag,
    Flex,
    Divider,
    Tooltip
} from "@chakra-ui/react";
import {
    FiMessageSquare,
    FiAlertTriangle,
    FiTrendingUp,
    FiFilter,
    FiSun,
    FiTarget
} from "react-icons/fi";

const parseDate = (value) => {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export default function TopicsInsights({ data, onQuickFilter }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");
    const neutralBg = useColorModeValue("gray.100", "gray.600");
    const positiveBg = useColorModeValue("green.100", "green.900");
    const negativeBg = useColorModeValue("red.100", "red.900");

    // Подсчет по темам
    const topicStats = {};
    const now = new Date();
    const last30 = new Date(now.getTime());
    last30.setDate(last30.getDate() - 30);
    const prev60 = new Date(now.getTime());
    prev60.setDate(prev60.getDate() - 60);

    const topicTrends = {};

    data.forEach(review => {
        const reviewDate = parseDate(review.date);
        const period = !reviewDate || reviewDate >= last30
            ? "recent"
            : (reviewDate >= prev60 ? "previous" : null);

        review.topics?.forEach((topic, index) => {
            if (!topicStats[topic]) {
                topicStats[topic] = {
                    count: 0,
                    positive: 0,
                    negative: 0,
                    neutral: 0
                };
            }

            if (!topicTrends[topic]) {
                topicTrends[topic] = {
                    recent: 0,
                    previous: 0
                };
            }

            topicStats[topic].count++;

            const sentiment = review.sentiments?.[index];
            if (sentiment === "положительно") topicStats[topic].positive++;
            else if (sentiment === "отрицательно") topicStats[topic].negative++;
            else topicStats[topic].neutral++;

            if (period === "recent") topicTrends[topic].recent++;
            if (period === "previous") topicTrends[topic].previous++;
        });
    });

    const addPercentages = (stats) => {
        const positivePercent = stats.count ? (stats.positive / stats.count) * 100 : 0;
        const negativePercent = stats.count ? (stats.negative / stats.count) * 100 : 0;
        const neutralPercent = Math.max(0, 100 - positivePercent - negativePercent);

        return {
            ...stats,
            positivePercent: Number(positivePercent.toFixed(1)),
            negativePercent: Number(negativePercent.toFixed(1)),
            neutralPercent: Number(neutralPercent.toFixed(1))
        };
    };

    const sortedTopics = Object.entries(topicStats)
        .map(([topic, stats]) => [topic, addPercentages(stats)])
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 8);

    const trendDetails = Object.entries(topicTrends).map(([topic, trend]) => ({
        topic,
        ...trend
    }));

    const trendingTopics = trendDetails
        .filter(item => item.recent >= 2)
        .sort((a, b) => b.recent - a.recent)
        .slice(0, 4);

    const topPositiveTopics = sortedTopics
        .map(([topic, stats]) => ({ topic, ...stats }))
        .sort((a, b) => b.positivePercent - a.positivePercent)
        .slice(0, 3);

    const topNegativeTopics = sortedTopics
        .map(([topic, stats]) => ({ topic, ...stats }))
        .sort((a, b) => b.negativePercent - a.negativePercent)
        .slice(0, 3);

    const mostProblematicTopic = topNegativeTopics.find(item => item.count >= 5);

    const handleTopicFilter = (topics, options) => {
        if (!onQuickFilter || !topics || topics.length === 0) return;
        onQuickFilter({ topics }, options);
    };

    const clearTopicFilter = () => {
        onQuickFilter?.({ topics: [] });
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
                <HStack justify="space-between" align={{ base: "flex-start", md: "center" }} spacing={4}>
                    <VStack align="flex-start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Анализ тем и инсайты
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Понимание ключевых драйверов лояльности и источников негатива
                        </Text>
                    </VStack>

                    <ButtonGroup size="xs" variant="ghost" colorScheme="brand" display={{ base: "none", lg: "flex" }}>
                        <Tooltip label="Показать самые проблемные темы">
                            <Button
                                leftIcon={<FiAlertTriangle />}
                                onClick={() => handleTopicFilter(topNegativeTopics.map(item => item.topic))}
                                isDisabled={topNegativeTopics.length === 0}
                                colorScheme="red"
                            >
                                Проблемы
                            </Button>
                        </Tooltip>
                        <Tooltip label="Показать темы с лучшим откликом">
                            <Button
                                leftIcon={<FiSun />}
                                onClick={() => handleTopicFilter(topPositiveTopics.map(item => item.topic))}
                                isDisabled={topPositiveTopics.length === 0}
                                colorScheme="green"
                            >
                                Лучшие
                            </Button>
                        </Tooltip>
                        <Tooltip label="Фокус на растущих трендах">
                            <Button
                                leftIcon={<FiTrendingUp />}
                                onClick={() => handleTopicFilter(trendingTopics.map(item => item.topic), { appendTopics: false })}
                                isDisabled={trendingTopics.length === 0}
                            >
                                Тренды
                            </Button>
                        </Tooltip>
                        <Tooltip label="Очистить фильтр по темам">
                            <Button leftIcon={<FiFilter />} onClick={clearTopicFilter}>
                                Все темы
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Stat>
                        <StatLabel fontSize="xs">Всего активных тем</StatLabel>
                        <StatNumber fontSize="2xl" color="brand.500">
                            {Object.keys(topicStats).length}
                        </StatNumber>
                        <StatHelpText>обнаруженных инсайтов</StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs">Самая обсуждаемая</StatLabel>
                        <StatNumber fontSize="sm" color="blue.500" noOfLines={1}>
                            {sortedTopics[0]?.[0] || "Нет данных"}
                        </StatNumber>
                        <StatHelpText>{sortedTopics[0]?.[1]?.count || 0} упоминаний</StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs">Главная зона риска</StatLabel>
                        <StatNumber fontSize="sm" color="red.500" noOfLines={1}>
                            {mostProblematicTopic?.topic || "Нет данных"}
                        </StatNumber>
                        <StatHelpText>
                            {mostProblematicTopic ? `${mostProblematicTopic.negativePercent.toFixed(1)}% негатива` : "Ситуация стабильная"}
                        </StatHelpText>
                    </Stat>
                </SimpleGrid>

                {trendingTopics.length > 0 && (
                    <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                            Темы с максимальным ростом внимания
                        </Text>
                        <Wrap spacing={2}>
                            {trendingTopics.map(({ topic, recent }) => (
                                <WrapItem key={topic}>
                                    <Tag
                                        size="md"
                                        colorScheme="green"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                    >
                                        <HStack spacing={2}>
                                            <Icon as={FiTrendingUp} />
                                            <Text fontSize="sm">{topic}</Text>
                                            <Badge variant="subtle" colorScheme="blue">{recent} упоминаний</Badge>
                                        </HStack>
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </VStack>
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box p={4} bg={positiveBg} borderRadius="lg">
                        <HStack mb={2} spacing={2}>
                            <Icon as={FiSun} color="green.500" />
                            <Text fontSize="sm" fontWeight="semibold">Вдохновляющие темы</Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                            {topPositiveTopics.map(item => (
                                <HStack key={item.topic} justify="space-between">
                                    <Text fontSize="xs" noOfLines={1}>{item.topic}</Text>
                                    <Badge colorScheme="green" variant="subtle">
                                        {item.positivePercent}%
                                    </Badge>
                                </HStack>
                            ))}
                            {topPositiveTopics.length === 0 && (
                                <Text fontSize="xs" color="gray.500">Недостаточно данных</Text>
                            )}
                        </VStack>
                    </Box>

                    <Box p={4} bg={negativeBg} borderRadius="lg">
                        <HStack mb={2} spacing={2}>
                            <Icon as={FiAlertTriangle} color="red.500" />
                            <Text fontSize="sm" fontWeight="semibold">Темы риска</Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                            {topNegativeTopics.map(item => (
                                <HStack key={item.topic} justify="space-between">
                                    <Text fontSize="xs" noOfLines={1}>{item.topic}</Text>
                                    <Badge colorScheme="red" variant="subtle">
                                        {item.negativePercent}%
                                    </Badge>
                                </HStack>
                            ))}
                            {topNegativeTopics.length === 0 && (
                                <Text fontSize="xs" color="gray.500">Негативных пиков не выявлено</Text>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>

                <Divider />

                <VStack align="stretch" spacing={4}>
                    {sortedTopics.map(([topic, stats]) => {
                        const trend = trendDetails.find(item => item.topic === topic);
                        const recentMentions = trend?.recent ?? 0;

                        return (
                            <Box key={topic} p={4} bg={subtleBg} borderRadius="lg">
                                <HStack justify="space-between" align="flex-start">
                                    <HStack spacing={3} align="flex-start">
                                        <Icon as={FiMessageSquare} color="brand.500" boxSize={5} mt={1} />
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="sm" fontWeight="semibold">
                                                {topic}
                                            </Text>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="blue" variant="subtle">{stats.count} упоминаний</Badge>
                                                {stats.negativePercent >= 50 && (
                                                    <Badge colorScheme="red" variant="solid">Высокий негатив</Badge>
                                                )}
                                                {stats.positivePercent >= 60 && (
                                                    <Badge colorScheme="green" variant="solid">Сильный позитив</Badge>
                                                )}
                                            </HStack>
                                        </VStack>
                                    </HStack>

                                    <VStack align="flex-end" spacing={2}>
                                        {recentMentions > 0 && (
                                            <Badge colorScheme="blue" variant="subtle">
                                                {recentMentions} упоминаний за 30 дней
                                            </Badge>
                                        )}
                                        <Button
                                            leftIcon={<FiTarget />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="brand"
                                            onClick={() => handleTopicFilter([topic])}
                                        >
                                            Фокус на теме
                                        </Button>
                                    </VStack>
                                </HStack>

                                <Flex mt={3} h="10px" borderRadius="full" overflow="hidden" bg={neutralBg}>
                                    <Box flexBasis={`${stats.positivePercent}%`} bg="green.400" />
                                    <Box flexBasis={`${stats.neutralPercent}%`} bg="gray.300" />
                                    <Box flexBasis={`${stats.negativePercent}%`} bg="red.400" />
                                </Flex>

                                <HStack mt={3} justify="space-between">
                                    <HStack spacing={2}>
                                        <Badge colorScheme="green" variant="subtle">{stats.positivePercent}% 👍</Badge>
                                        <Badge colorScheme="gray" variant="subtle">{stats.neutralPercent}% 😐</Badge>
                                        <Badge colorScheme="red" variant="subtle">{stats.negativePercent}% 👎</Badge>
                                    </HStack>
                                </HStack>
                            </Box>
                        );
                    })}
                </VStack>

                {mostProblematicTopic && mostProblematicTopic.negativePercent > 60 && (
                    <Box mt={2} p={4} bg={negativeBg} borderRadius="lg" border="1px" borderColor="red.200">
                        <HStack spacing={3} align="flex-start">
                            <Icon as={FiAlertTriangle} color="red.500" mt={1} />
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="sm" fontWeight="bold" color="red.700">
                                    Критический сигнал: {mostProblematicTopic.topic}
                                </Text>
                                <Text fontSize="xs" color="red.600">
                                    {mostProblematicTopic.negativePercent.toFixed(1)}% отзывов содержат жалобы. Рекомендуется приоритезировать обратную связь по этой теме.
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}