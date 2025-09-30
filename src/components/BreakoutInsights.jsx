import {
    Box,
    VStack,
    HStack,
    Text,
    Icon,
    Badge,
    SimpleGrid,
    Progress,
    useColorModeValue,
    Tooltip,
    Button,
    Tag,
    TagLabel
} from "@chakra-ui/react";
import {
    FiCompass,
    FiAlertTriangle,
    FiAward,
    FiTrendingUp,
    FiTrendingDown,
    FiArchive
} from "react-icons/fi";
import { useMemo } from "react";

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeTopic = (topic) => topic?.trim();

const partitionByRecency = (data) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 28);

    const recent = [];
    const previous = [];

    data.forEach((review) => {
        const date = parseDate(review.date);
        if (!date) return;
        if (date >= twoWeeksAgo) {
            recent.push(review);
        } else if (date >= monthAgo && date < twoWeeksAgo) {
            previous.push(review);
        }
    });

    return { recent, previous };
};

const aggregateTopics = (reviews) => {
    const stats = new Map();

    reviews.forEach((review) => {
        review.topics?.forEach((topic, index) => {
            const normalized = normalizeTopic(topic);
            if (!normalized) return;
            if (!stats.has(normalized)) {
                stats.set(normalized, {
                    count: 0,
                    negative: 0,
                    positive: 0
                });
            }
            const entry = stats.get(normalized);
            entry.count += 1;
            const sentiment = review.sentiments?.[index];
            if (sentiment === "отрицательно") entry.negative += 1;
            if (sentiment === "положительно") entry.positive += 1;
        });
    });

    return stats;
};

const computeBreakouts = (data) => {
    const { recent, previous } = partitionByRecency(data);
    const recentStats = aggregateTopics(recent);
    const previousStats = aggregateTopics(previous);

    const mergedTopics = new Set([
        ...Array.from(recentStats.keys()),
        ...Array.from(previousStats.keys())
    ]);

    const entries = Array.from(mergedTopics).map((topic) => {
        const recentEntry = recentStats.get(topic) || { count: 0, negative: 0, positive: 0 };
        const previousEntry = previousStats.get(topic) || { count: 0, negative: 0, positive: 0 };

        const growth = previousEntry.count
            ? ((recentEntry.count - previousEntry.count) / previousEntry.count) * 100
            : recentEntry.count > 0
                ? 100
                : 0;

        const negativeRate = recentEntry.count ? (recentEntry.negative / recentEntry.count) * 100 : 0;
        const positiveRate = recentEntry.count ? (recentEntry.positive / recentEntry.count) * 100 : 0;

        return {
            topic,
            recent: recentEntry.count,
            previous: previousEntry.count,
            growth,
            negativeRate,
            positiveRate
        };
    });

    const breakoutTopics = entries
        .filter((entry) => entry.recent >= 3)
        .sort((a, b) => b.growth - a.growth)
        .slice(0, 5);

    const riskTopics = entries
        .filter((entry) => entry.recent >= 3)
        .filter((entry) => entry.negativeRate >= 55)
        .sort((a, b) => b.negativeRate - a.negativeRate)
        .slice(0, 5);

    const championTopics = entries
        .filter((entry) => entry.recent >= 3)
        .filter((entry) => entry.positiveRate >= 60)
        .sort((a, b) => b.positiveRate - a.positiveRate)
        .slice(0, 5);

    return { breakoutTopics, riskTopics, championTopics };
};

const TrendIcon = ({ growth }) => {
    if (growth > 5) {
        return <Icon as={FiTrendingUp} color="green.500" />;
    }
    if (growth < -5) {
        return <Icon as={FiTrendingDown} color="red.500" />;
    }
    return null;
};

const TopicList = ({
    title,
    description,
    icon,
    colorScheme,
    data,
    metricKey,
    metricLabel,
    badgeFormatter,
    onQuickFilter
}) => {
    const bg = useColorModeValue("white", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtextColor = useColorModeValue("gray.600", "gray.400");
    const iconBg = useColorModeValue("gray.100", "gray.700");
    const itemBg = useColorModeValue("gray.50", "gray.800");
    const itemBorderColor = useColorModeValue("gray.200", "gray.700");

    return (
        <Box
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            p={6}
            bg={bg}
            shadow="lg"
            h="100%"
        >
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                    <HStack spacing={3}>
                        <Box
                            w={10}
                            h={10}
                            borderRadius="full"
                            bg={iconBg}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon as={icon} color={`brand.500`} />
                        </Box>
                        <VStack align="flex-start" spacing={0}>
                            <Text fontWeight="bold">{title}</Text>
                            <Text fontSize="xs" color={subtextColor}>
                                {description}
                            </Text>
                        </VStack>
                    </HStack>
                    <Badge colorScheme={colorScheme} variant="subtle">
                        {data.length}
                    </Badge>
                </HStack>
                <VStack align="stretch" spacing={3}>
                    {data.length === 0 && (
                        <Text fontSize="sm" color={subtextColor}>
                            Данных пока недостаточно.
                        </Text>
                    )}
                    {data.map((item) => (
                        <Box
                            key={item.topic}
                            borderRadius="lg"
                            p={4}
                            bg={itemBg}
                            border="1px"
                            borderColor={itemBorderColor}
                        >
                            <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                    <VStack align="flex-start" spacing={0}>
                                        <Text fontWeight="semibold">{item.topic}</Text>
                                        <HStack spacing={2}>
                                            <Badge colorScheme="brand" variant="subtle">
                                                {badgeFormatter(item)}
                                            </Badge>
                                            <Tag size="sm" colorScheme="gray" borderRadius="full">
                                                <TagLabel>{item.recent} упоминаний</TagLabel>
                                            </Tag>
                                        </HStack>
                                    </VStack>
                                    <TrendIcon growth={item.growth} />
                                </HStack>
                                <Tooltip label={`${metricLabel}: ${item[metricKey].toFixed(1)}%`} placement="top">
                                    <Progress
                                        value={Math.min(Math.abs(item[metricKey]), 100)}
                                        colorScheme={colorScheme}
                                        size="sm"
                                        borderRadius="full"
                                    />
                                </Tooltip>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onQuickFilter?.({ topics: [item.topic] })}
                                >
                                    Смотреть отзывы по теме
                                </Button>
                            </VStack>
                        </Box>
                    ))}
                </VStack>
            </VStack>
        </Box>
    );
};

export default function BreakoutInsights({ data, onQuickFilter, hasRecentData }) {
    const subtextColor = useColorModeValue("gray.600", "gray.400");
    const placeholderBg = useColorModeValue("white", "gray.900");
    const placeholderBorder = useColorModeValue("gray.200", "gray.700");

    const { breakoutTopics, riskTopics, championTopics } = useMemo(
        () => computeBreakouts(data || []),
        [data]
    );

    return (
        <VStack align="stretch" spacing={4}>
            <VStack align="flex-start" spacing={1}>
                <HStack spacing={3}>
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Фокус на всплесках тем
                    </Text>
                    <Badge colorScheme={hasRecentData ? "brand" : "gray"} variant="subtle" borderRadius="full">
                        {hasRecentData ? "≤ 30 дней" : "Исторический период"}
                    </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                    Отслеживайте темы, которые резко выросли в упоминаниях, несут риск или становятся точками роста
                </Text>
            </VStack>
            {hasRecentData ? (
                <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
                    <TopicList
                        title="Взрывной рост"
                        description="Темы с максимальным приростом обсуждений"
                        icon={FiCompass}
                        colorScheme="blue"
                        data={breakoutTopics}
                        metricKey="growth"
                        metricLabel="Прирост упоминаний"
                        badgeFormatter={(item) => `${item.growth.toFixed(1)}%`}
                        onQuickFilter={onQuickFilter}
                    />
                    <TopicList
                        title="Зона риска"
                        description="Направления с критичным негативом"
                        icon={FiAlertTriangle}
                        colorScheme="red"
                        data={riskTopics}
                        metricKey="negativeRate"
                        metricLabel="Негатив"
                        badgeFormatter={(item) => `${item.negativeRate.toFixed(1)}% негатива`}
                        onQuickFilter={onQuickFilter}
                    />
                    <TopicList
                        title="Источники восторга"
                        description="Что радует клиентов сверх нормы"
                        icon={FiAward}
                        colorScheme="green"
                        data={championTopics}
                        metricKey="positiveRate"
                        metricLabel="Позитив"
                        badgeFormatter={(item) => `${item.positiveRate.toFixed(1)}% позитива`}
                        onQuickFilter={onQuickFilter}
                    />
                </SimpleGrid>
            ) : (
                <Box
                    borderRadius="2xl"
                    border="1px"
                    borderColor={placeholderBorder}
                    p={8}
                    bg={placeholderBg}
                    shadow="lg"
                >
                    <VStack spacing={3} align="center">
                        <Icon as={FiArchive} boxSize={8} color="brand.500" />
                        <Text fontWeight="semibold" textAlign="center">
                            Аналитика всплесков доступна только для свежих данных
                        </Text>
                        <Text fontSize="sm" color={subtextColor} textAlign="center" maxW="540px">
                            Выбранный период не содержит отзывов за последние 30 дней. Используйте другие блоки панели, чтобы изучить исторические тренды, или сузьте диапазон дат до более актуального интервала.
                        </Text>
                    </VStack>
                </Box>
            )}
        </VStack>
    );
}
