import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip,
    CircularProgress,
    CircularProgressLabel,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Button,
    ButtonGroup,
    Flex,
    Divider
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiFilter, FiRotateCcw } from "react-icons/fi";

const sentimentMeta = {
    положительно: {
        label: "Позитивные",
        color: "green",
        icon: FiTrendingUp,
    },
    нейтрально: {
        label: "Нейтральные",
        color: "gray",
        icon: FiMinus,
    },
    отрицательно: {
        label: "Негативные",
        color: "red",
        icon: FiTrendingDown,
    }
};

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getSentimentCounts = (items = []) => ({
    положительно: items.filter(item => item.sentiments?.includes("положительно")).length,
    нейтрально: items.filter(item => item.sentiments?.includes("нейтрально")).length,
    отрицательно: items.filter(item => item.sentiments?.includes("отрицательно")).length,
});

export default function SentimentAnalysis({ data, onQuickFilter }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorderColor = useColorModeValue("gray.100", "gray.700");
    const subtleBg = useColorModeValue("gray.50", "gray.700");
    const progressTrackBg = useColorModeValue("gray.200", "gray.600");
    const progressTrackColor = useColorModeValue("gray.100", "gray.700");
    const insightBg = useColorModeValue("brand.50", "gray.700");
    const insightBorder = useColorModeValue("brand.100", "gray.600");

    const totalReviews = data.length;
    const sentimentCounts = getSentimentCounts(data);

    const getPercent = (value) => (totalReviews ? Number(((value / totalReviews) * 100).toFixed(1)) : 0);
    const sentimentPercentages = {
        положительно: getPercent(sentimentCounts.положительно),
        нейтрально: getPercent(sentimentCounts.нейтрально),
        отрицательно: getPercent(sentimentCounts.отрицательно),
    };

    const now = new Date();
    const last30 = new Date(now.getTime());
    last30.setDate(last30.getDate() - 30);
    const prev60 = new Date(now.getTime());
    prev60.setDate(prev60.getDate() - 60);

    const recentData = data.filter(item => {
        const date = parseDate(item.date);
        return !date || date >= last30;
    });

    const previousPeriodData = data.filter(item => {
        const date = parseDate(item.date);
        return date && date >= prev60 && date < last30;
    });

    const recentCounts = getSentimentCounts(recentData);
    const previousCounts = getSentimentCounts(previousPeriodData);
    const recentTotal = recentData.length;
    const previousTotal = previousPeriodData.length;
    const recentPositiveShare = recentTotal
        ? Number(((recentCounts.положительно / recentTotal) * 100).toFixed(1))
        : 0;
    const previousPositiveShare = previousTotal
        ? Number(((previousCounts.положительно / previousTotal) * 100).toFixed(1))
        : 0;

    const hasRecentWindow = recentTotal > 0;
    const hasPreviousWindow = previousTotal > 0;

    const sentimentScore = totalReviews
        ? Number((((sentimentCounts.положительно - sentimentCounts.отрицательно) / totalReviews) * 100).toFixed(1))
        : 0;

    const scoreColor = sentimentScore >= 25 ? "green" : sentimentScore >= 0 ? "yellow" : "red";
    const dominantSentiment = Object.entries(sentimentCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

    const insightText = (() => {
        if (sentimentScore >= 35) {
            return "Отличный баланс настроений — поддерживайте текущий уровень сервиса.";
        }
        if (sentimentScore >= 15) {
            return "Хороший уровень лояльности. Усильте позитив за счёт быстрого решения проблем.";
        }
        if (sentimentScore >= 0) {
            return "Ситуация стабильна, но стоит уделить внимание потенциальным очагам негатива.";
        }
        return "Негатив доминирует — необходимо приоритезировать обработку проблемных отзывов.";
    })();

    const handleSentimentFilter = (sentiments) => {
        onQuickFilter?.({ sentiments });
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
                <HStack align="flex-start" justify="space-between" spacing={3}>
                    <VStack align="flex-start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Анализ настроений
                        </Text>
                        <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                                {totalReviews} отзывов
                            </Badge>
                            {dominantSentiment && (
                                <Badge colorScheme={sentimentMeta[dominantSentiment]?.color || "gray"} variant="outline">
                                    Доминирует: {sentimentMeta[dominantSentiment]?.label || dominantSentiment}
                                </Badge>
                            )}
                        </HStack>
                    </VStack>

                    <ButtonGroup size="xs" variant="ghost" colorScheme="brand">
                        <Tooltip label="Показать только позитивные отзывы">
                            <Button leftIcon={<FiFilter />} onClick={() => handleSentimentFilter(["положительно"]) }>
                                Позитив
                            </Button>
                        </Tooltip>
                        <Tooltip label="Показать нейтральные отзывы">
                            <Button leftIcon={<FiFilter />} onClick={() => handleSentimentFilter(["нейтрально"]) }>
                                Нейтрально
                            </Button>
                        </Tooltip>
                        <Tooltip label="Показать проблемные отзывы">
                            <Button leftIcon={<FiFilter />} colorScheme="red" onClick={() => handleSentimentFilter(["отрицательно"]) }>
                                Негатив
                            </Button>
                        </Tooltip>
                        <Tooltip label="Сбросить фильтры настроений">
                            <Button leftIcon={<FiRotateCcw />} onClick={() => handleSentimentFilter([])}>
                                Все
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
                    <VStack spacing={4} align="center" justify="center">
                        <CircularProgress
                            value={sentimentPercentages.положительно}
                            size="160px"
                            thickness="10px"
                            color="green.400"
                            trackColor={progressTrackColor}
                        >
                            <CircularProgressLabel>
                                <VStack spacing={0}>
                                    <Text fontSize="3xl" fontWeight="bold" color="green.500">
                                        {sentimentPercentages.положительно}%
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">доля позитива</Text>
                                </VStack>
                            </CircularProgressLabel>
                        </CircularProgress>
                        {hasRecentWindow ? (
                            <VStack spacing={1}>
                                <Badge colorScheme="green" variant="solid">
                                    {recentPositiveShare}% позитива за 30 дней
                                </Badge>
                                {hasPreviousWindow && (
                                    <Text fontSize="xs" color="gray.500">
                                        Предыдущий период: {previousPositiveShare}% позитива
                                    </Text>
                                )}
                                <HStack spacing={2}>
                                    <Badge colorScheme="green" variant="subtle">
                                        {recentCounts.положительно} позитивных
                                    </Badge>
                                    <Badge colorScheme="red" variant="subtle">
                                        {recentCounts.отрицательно} негативных
                                    </Badge>
                                </HStack>
                            </VStack>
                        ) : (
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                Используются исторические данные без свежей динамики
                            </Text>
                        )}
                    </VStack>

                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} w="full">
                        {Object.entries(sentimentMeta).map(([key, meta]) => (
                            <Box
                                key={key}
                                p={4}
                                borderRadius="lg"
                                border="1px"
                                borderColor={cardBorderColor}
                                bg={cardBg}
                                shadow="sm"
                            >
                                <Stat>
                                    <StatLabel fontSize="xs" textTransform="uppercase" color="gray.500">
                                        {meta.label}
                                    </StatLabel>
                                    <StatNumber fontSize="xl">
                                        {sentimentCounts[key]}
                                    </StatNumber>
                                    <StatHelpText color={`${meta.color}.500`}>
                                        {sentimentPercentages[key]}%
                                    </StatHelpText>
                                </Stat>
                            </Box>
                        ))}
                    </SimpleGrid>
                </SimpleGrid>

                <VStack align="stretch" spacing={4}>
                    {Object.entries(sentimentMeta).map(([key, meta]) => {
                        const percentage = sentimentPercentages[key];

                        return (
                            <Box key={key} p={4} bg={subtleBg} borderRadius="lg">
                                <HStack justify="space-between" align="flex-start">
                                    <HStack spacing={3}>
                                        <Icon as={meta.icon} color={`${meta.color}.400`} boxSize={5} />
                                        <VStack spacing={0} align="flex-start">
                                            <Text fontSize="sm" fontWeight="semibold">
                                                {meta.label}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                                {key === "отрицательно" ? "Область внимания" : key === "положительно" ? "Главные драйверы лояльности" : "Стабильные отзывы"}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <VStack spacing={1} align="flex-end">
                                        <Text fontSize="sm" fontWeight="bold" color={`${meta.color}.500`}>
                                            {percentage}%
                                        </Text>
                                        <Badge variant="subtle" colorScheme={meta.color}>
                                            {sentimentCounts[key]} отзывов
                                        </Badge>
                                        <Button
                                            leftIcon={<FiFilter />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme={meta.color}
                                            onClick={() => handleSentimentFilter([key])}
                                        >
                                            Фильтр
                                        </Button>
                                    </VStack>
                                </HStack>

                                <Flex mt={3} h="8px" borderRadius="full" overflow="hidden" bg={progressTrackBg}>
                                    <Box flexBasis={`${percentage}%`} bg={`${meta.color}.400`} />
                                    <Box flexGrow={1} bg="transparent" />
                                </Flex>
                            </Box>
                        );
                    })}
                </VStack>

                <Divider />

                <Box p={5} borderRadius="lg" bg={insightBg} border="1px" borderColor={insightBorder}>
                    <HStack justify="space-between" align={{ base: "flex-start", md: "center" }} flexDir={{ base: "column", md: "row" }} spacing={4}>
                        <VStack align="flex-start" spacing={1}>
                            <Text fontSize="sm" fontWeight="bold">
                                Индекс удовлетворенности клиентов
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Рассчитывается как разница между долей позитивных и негативных отзывов
                            </Text>
                        </VStack>
                        <Badge
                            colorScheme={scoreColor}
                            variant="solid"
                            px={4}
                            py={2}
                            borderRadius="md"
                            fontSize="md"
                        >
                            {sentimentScore}%
                        </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mt={3}>
                        {insightText}
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
}