import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    Icon,
    SimpleGrid,
    Divider,
    useColorModeValue,
    Tooltip,
    Flex
} from "@chakra-ui/react";
import {
    FiFilter,
    FiRefreshCw,
    FiZap,
    FiShield,
    FiStar,
    FiTrendingUp,
    FiTarget
} from "react-icons/fi";
import { useMemo } from "react";

const parseRating = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const getDominantTopic = (data = []) => {
    const topicCounts = new Map();
    data.forEach((review) => {
        review.topics?.forEach((topic) => {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
    });

    let dominant = null;
    let maxCount = 0;
    topicCounts.forEach((count, topic) => {
        if (count > maxCount) {
            dominant = topic;
            maxCount = count;
        }
    });

    return dominant ? { topic: dominant, count: maxCount } : null;
};

const getMoodIndex = (data = []) => {
    if (!data.length) return 0;
    const positive = data.filter((r) => r.sentiments?.includes("положительно")).length;
    const negative = data.filter((r) => r.sentiments?.includes("отрицательно")).length;
    const neutral = data.filter((r) => r.sentiments?.includes("нейтрально")).length;
    const total = positive + negative + neutral;
    if (!total) return 0;

    const weighted = (positive * 1 + neutral * 0 - negative * 1) / total;
    return Math.round((weighted + 1) * 50); // 0..100 index
};

const summarizeCity = (data = []) => {
    const cityCounts = new Map();
    data.forEach((review) => {
        const city = review.city?.trim();
        if (!city) return;
        const formatted = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        cityCounts.set(formatted, (cityCounts.get(formatted) || 0) + 1);
    });

    if (!cityCounts.size) return null;

    const sorted = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1]);
    const [topCity, topCount] = sorted[0];
    return { city: topCity, count: topCount };
};

const gradientBackground = {
    light: "linear-gradient(135deg, rgba(0,75,135,0.12) 0%, rgba(0,75,135,0.03) 65%, rgba(255,255,255,0.9) 100%)",
    dark: "linear-gradient(135deg, rgba(0,75,135,0.45) 0%, rgba(0,75,135,0.15) 70%, rgba(15,23,42,0.9) 100%)"
};

export default function ExperienceCommandCenter({
    data,
    filters,
    onFilterToggle,
    isFilterOpen,
    activeFiltersCount,
    onClearFilters,
    onRefresh,
    loading,
    onQuickFilter,
    renderExport,
    hasRecentData,
    latestReviewDate
}) {
    const bg = useColorModeValue(gradientBackground.light, gradientBackground.dark);
    const panelBg = useColorModeValue("white", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const quickActionPalette = useColorModeValue(
        {
            text: "gray.800",
            border: "rgba(15,23,42,0.08)",
            hoverBorder: "rgba(15,23,42,0.16)",
            shadow: "0 20px 45px -24px rgba(15,23,42,0.4)",
            crisis: {
                bg: "linear-gradient(140deg, rgba(255,120,110,0.24) 0%, rgba(255,255,255,0.18) 100%)",
                hover: "linear-gradient(140deg, rgba(255,120,110,0.32) 0%, rgba(255,255,255,0.22) 100%)",
                active: "linear-gradient(140deg, rgba(255,120,110,0.38) 0%, rgba(255,255,255,0.25) 100%)",
                icon: "rgba(220,64,59,0.9)",
                iconBg: "rgba(220,64,59,0.16)"
            },
            promoter: {
                bg: "linear-gradient(140deg, rgba(56,189,149,0.22) 0%, rgba(255,255,255,0.18) 100%)",
                hover: "linear-gradient(140deg, rgba(56,189,149,0.3) 0%, rgba(255,255,255,0.22) 100%)",
                active: "linear-gradient(140deg, rgba(56,189,149,0.36) 0%, rgba(255,255,255,0.25) 100%)",
                icon: "rgba(34,139,104,0.95)",
                iconBg: "rgba(34,139,104,0.16)"
            },
            monitor: {
                bg: "linear-gradient(140deg, rgba(0,102,204,0.18) 0%, rgba(255,255,255,0.15) 100%)",
                hover: "linear-gradient(140deg, rgba(0,102,204,0.26) 0%, rgba(255,255,255,0.2) 100%)",
                active: "linear-gradient(140deg, rgba(0,102,204,0.3) 0%, rgba(255,255,255,0.24) 100%)",
                icon: "rgba(0,91,191,1)",
                iconBg: "rgba(0,91,191,0.14)"
            }
        },
        {
            text: "gray.100",
            border: "rgba(148,163,184,0.2)",
            hoverBorder: "rgba(148,163,184,0.32)",
            shadow: "0 24px 48px -20px rgba(8,27,51,0.75)",
            crisis: {
                bg: "linear-gradient(140deg, rgba(220,64,59,0.35) 0%, rgba(15,23,42,0.55) 100%)",
                hover: "linear-gradient(140deg, rgba(220,64,59,0.42) 0%, rgba(15,23,42,0.6) 100%)",
                active: "linear-gradient(140deg, rgba(220,64,59,0.5) 0%, rgba(15,23,42,0.65) 100%)",
                icon: "rgba(255,158,150,0.95)",
                iconBg: "rgba(220,64,59,0.28)"
            },
            promoter: {
                bg: "linear-gradient(140deg, rgba(56,189,149,0.3) 0%, rgba(15,23,42,0.55) 100%)",
                hover: "linear-gradient(140deg, rgba(56,189,149,0.36) 0%, rgba(15,23,42,0.6) 100%)",
                active: "linear-gradient(140deg, rgba(56,189,149,0.42) 0%, rgba(15,23,42,0.65) 100%)",
                icon: "rgba(154,230,180,0.95)",
                iconBg: "rgba(56,189,149,0.26)"
            },
            monitor: {
                bg: "linear-gradient(140deg, rgba(80,140,255,0.3) 0%, rgba(15,23,42,0.55) 100%)",
                hover: "linear-gradient(140deg, rgba(80,140,255,0.38) 0%, rgba(15,23,42,0.6) 100%)",
                active: "linear-gradient(140deg, rgba(80,140,255,0.44) 0%, rgba(15,23,42,0.65) 100%)",
                icon: "rgba(176,210,255,0.95)",
                iconBg: "rgba(80,140,255,0.24)"
            }
        }
    );
    const secondaryBadgeColor = hasRecentData ? "green" : (loading ? "yellow" : "gray");
    const recencyLabel = hasRecentData
        ? "Свежие данные ≤ 30 дней"
        : (loading ? "Загрузка данных" : "Исторический период");

    const summary = useMemo(() => {
        if (!data?.length) {
            return {
                total: 0,
                avgRating: 0,
                promoterShare: 0,
                detractorShare: 0,
                dominantTopic: null,
                spotlightCity: null,
                moodIndex: 0
            };
        }

        const total = data.length;
        const ratings = data
            .map((item) => parseRating(item.rating))
            .filter((value) => typeof value === "number");
        const avgRating = ratings.length
            ? ratings.reduce((acc, value) => acc + value, 0) / ratings.length
            : 0;

        const positive = data.filter((item) => item.sentiments?.includes("положительно")).length;
        const negative = data.filter((item) => item.sentiments?.includes("отрицательно")).length;

        return {
            total,
            avgRating,
            promoterShare: total ? Math.round((positive / total) * 100) : 0,
            detractorShare: total ? Math.round((negative / total) * 100) : 0,
            dominantTopic: getDominantTopic(data),
            spotlightCity: summarizeCity(data),
            moodIndex: getMoodIndex(data)
        };
    }, [data]);

    const dateRangeLabel = useMemo(() => {
        if (!filters?.dateFrom && !filters?.dateTo) return "Все время";
        if (filters?.dateFrom && filters?.dateTo) return `${filters.dateFrom} — ${filters.dateTo}`;
        if (filters?.dateFrom) return `C ${filters.dateFrom}`;
        if (filters?.dateTo) return `До ${filters.dateTo}`;
        return "Сводка";
    }, [filters]);

    const lastReviewLabel = latestReviewDate
        ? latestReviewDate.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        : "нет данных";

    const daysSinceLastReview = latestReviewDate
        ? Math.max(0, Math.round((Date.now() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

    const quickActions = [
        {
            key: "crisis",
            label: "Антикризис: негатив <90%",
            description: "Быстрый фокус на жалобах и просадках NPS",
            icon: FiShield,
            palette: quickActionPalette.crisis,
            onClick: () => onQuickFilter?.({ sentiments: ["отрицательно"] })
        },
        {
            key: "promoter",
            label: "Позитивные отзывы",
            description: "Высокие оценки и положительные эмоции 4-5★",
            icon: FiStar,
            palette: quickActionPalette.promoter,
            onClick: () => onQuickFilter?.({ sentiments: ["положительно"], ratingRange: [4, 5] })
        },
        {
            key: "monitor",
            label: "Режим: живой мониторинг",
            description: hasRecentData
                ? "Следим за свежими всплесками в live-режиме"
                : "Недоступно без свежих отзывов",
            icon: FiZap,
            palette: quickActionPalette.monitor,
            onClick: () => onQuickFilter?.({ searchText: "" }),
            disabled: !hasRecentData,
            tooltip: hasRecentData ? "Режим прямого мониторинга" : "Недоступно: нет свежих отзывов"
        }
    ];

    return (
        <Box px={6}>
            <Box
                borderRadius="3xl"
                bg={bg}
                border="1px"
                borderColor={borderColor}
                overflow="hidden"
                position="relative"
                shadow="2xl"
            >
                <Box px={{ base: 6, lg: 10 }} py={{ base: 8, lg: 10 }}>
                    <VStack spacing={8} align="stretch">
                        <Flex direction={{ base: "column", xl: "row" }} justify="space-between" gap={8}>
                            <VStack align="flex-start" spacing={4} maxW={{ base: "100%", xl: "60%" }}>
                                <HStack spacing={3} flexWrap="wrap">
                                    <Badge colorScheme="brand" variant="solid" borderRadius="full" px={4} py={1}>
                                        Командный центр клиентского опыта
                                    </Badge>
                                    <Badge
                                        colorScheme={secondaryBadgeColor}
                                        variant="subtle"
                                        borderRadius="full"
                                        px={4}
                                        py={1}
                                    >
                                        {recencyLabel}
                                    </Badge>
                                </HStack>
                                <Heading size="lg" lineHeight="1.2">
                                    Управляйте эмоциями клиентов через данные и мгновенные сценарии
                                </Heading>
                                <Text color={subtextColor} fontSize="md" maxW={{ base: "100%", md: "80%" }}>
                                    Настраивайте фокус, ловите всплески эмоций и запускайте антикризисные сценарии за секунды — всё в одном месте.
                                </Text>
                                <Text fontSize="sm" color={subtextColor}>
                                    Последний доступный отзыв: {lastReviewLabel}
                                    {typeof daysSinceLastReview === "number" ? ` (${daysSinceLastReview} дн. назад)` : ""}
                                </Text>
                                <HStack spacing={3} flexWrap="wrap">
                                    {renderExport ? renderExport() : null}
                                    <Tooltip label={isFilterOpen ? "Скрыть фильтры" : "Открыть расширенный фильтр"}>
                                        <Button
                                            leftIcon={<Icon as={FiFilter} />}
                                            variant={isFilterOpen ? "solid" : "outline"}
                                            colorScheme="brand"
                                            size="sm"
                                            onClick={onFilterToggle}
                                        >
                                            Фильтры
                                            {activeFiltersCount > 0 && (
                                                <Badge ml={2} colorScheme="red" variant="solid" borderRadius="full">
                                                    {activeFiltersCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label="Мгновенно обновить данные">
                                        <Button
                                            leftIcon={<Icon as={FiRefreshCw} />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={onRefresh}
                                            isLoading={loading}
                                        >
                                            Обновить
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label="Очистить выбранные фильтры">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClearFilters}
                                            isDisabled={activeFiltersCount === 0}
                                        >
                                            Сбросить
                                        </Button>
                                    </Tooltip>
                                    {summary.dominantTopic && (
                                        <Tooltip label="Фокус на главной теме недели">
                                            <Button
                                                leftIcon={<Icon as={FiTarget} />}
                                                size="sm"
                                                colorScheme="purple"
                                                onClick={() =>
                                                    onQuickFilter?.({ topics: [summary.dominantTopic.topic] })
                                                }
                                            >
                                                Фокус: {summary.dominantTopic.topic}
                                            </Button>
                                        </Tooltip>
                                    )}
                                </HStack>
                            </VStack>

                            <Box
                                bg={panelBg}
                                borderRadius="2xl"
                                border="1px"
                                borderColor={borderColor}
                                px={6}
                                py={6}
                                shadow="lg"
                                minW={{ base: "auto", xl: "320px" }}
                            >
                                <VStack align="stretch" spacing={4}>
                                    <HStack justify="space-between">
                                        <Text fontSize="sm" color={subtextColor}>
                                            Интервал
                                        </Text>
                                        <Badge colorScheme="brand" variant="subtle">
                                            {dateRangeLabel}
                                        </Badge>
                                    </HStack>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                                                Отзывов
                                            </Text>
                                            <HStack>
                                                <Icon as={FiZap} color="brand.500" />
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {summary.total.toLocaleString("ru-RU")}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                                                Индекс эмоций
                                            </Text>
                                            <HStack>
                                                <Icon as={FiTrendingUp} color="green.500" />
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {summary.moodIndex}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                                                Промоутеры
                                            </Text>
                                            <HStack>
                                                <Icon as={FiStar} color="yellow.400" />
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {summary.promoterShare}%
                                                </Text>
                                            </HStack>
                                        </VStack>
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="xs" color={subtextColor} textTransform="uppercase">
                                                Детракторы
                                            </Text>
                                            <HStack>
                                                <Icon as={FiShield} color="red.400" />
                                                <Text fontWeight="bold" fontSize="lg">
                                                    {summary.detractorShare}%
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </SimpleGrid>
                                    <Divider />
                                    <VStack align="flex-start" spacing={3}>
                                        {summary.dominantTopic && (
                                            <HStack spacing={3} align="flex-start">
                                                <Badge colorScheme="purple" variant="subtle" borderRadius="full">
                                                    Топ тема
                                                </Badge>
                                                <VStack spacing={0} align="flex-start">
                                                    <Text fontWeight="semibold">{summary.dominantTopic.topic}</Text>
                                                    <Text fontSize="xs" color={subtextColor}>
                                                        {summary.dominantTopic.count.toLocaleString("ru-RU")} упоминаний
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        )}
                                        {summary.spotlightCity && (
                                            <HStack spacing={3} align="flex-start">
                                                <Badge colorScheme="teal" variant="subtle" borderRadius="full">
                                                    Гео-лидер
                                                </Badge>
                                                <VStack spacing={0} align="flex-start">
                                                    <Text fontWeight="semibold">{summary.spotlightCity.city}</Text>
                                                    <Text fontSize="xs" color={subtextColor}>
                                                        {summary.spotlightCity.count.toLocaleString("ru-RU")} отзывов
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        )}
                                        <HStack spacing={3} align="flex-start">
                                            <Badge colorScheme="pink" variant="subtle" borderRadius="full">
                                                Средний рейтинг
                                            </Badge>
                                            <Text fontWeight="semibold">
                                                {summary.avgRating ? summary.avgRating.toFixed(1) : "—"} / 5
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            </Box>
                        </Flex>

                        <Box
                            display="grid"
                            gridTemplateColumns={{ base: "1fr", xl: "repeat(3, 1fr)" }}
                            gap={{ base: 3, md: 4 }}
                            w="full"
                        >
                            {quickActions.map((action) => {
                                const card = (
                                    <Button
                                        w="100%"
                                        variant="ghost"
                                        onClick={action.onClick}
                                        isDisabled={action.disabled}
                                        border="1px solid"
                                        borderColor={quickActionPalette.border}
                                        color={quickActionPalette.text}
                                        background={action.palette.bg}
                                        backdropFilter="blur(12px)"
                                        boxShadow="none"
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="center"
                                        gap={2.5}
                                        py={4}
                                        px={4}
                                        minH="132px"
                                        textAlign="center"
                                        fontWeight="semibold"
                                        lineHeight="1.35"
                                        transition="all 0.24s ease"
                                        _hover={{
                                            background: action.palette.hover,
                                            borderColor: quickActionPalette.hoverBorder,
                                            boxShadow: quickActionPalette.shadow,
                                            transform: "translateY(-3px)"
                                        }}
                                        _active={{
                                            background: action.palette.active,
                                            transform: "translateY(-0.5px)"
                                        }}
                                        _focusVisible={{
                                            boxShadow: `0 0 0 3px ${action.palette.iconBg || "rgba(59,130,246,0.45)"}`
                                        }}
                                        _disabled={{
                                            opacity: 0.65,
                                            cursor: "not-allowed",
                                            boxShadow: "none",
                                            transform: "none",
                                            background: action.palette.bg,
                                            borderColor: quickActionPalette.border
                                        }}
                                    >
                                        <Flex
                                            align="center"
                                            justify="center"
                                            w={9}
                                            h={9}
                                            borderRadius="full"
                                            background={action.palette.iconBg}
                                            boxShadow="inset 0 1px 2px rgba(255,255,255,0.32)"
                                        >
                                            <Icon as={action.icon} fontSize="1.25rem" color={action.palette.icon} />
                                        </Flex>
                                        <VStack spacing={1.5} align="center" w="full">
                                            <Text fontSize="md" fontWeight="semibold">
                                                {action.label}
                                            </Text>
                                            {action.description && (
                                                <Text fontSize="sm" color={subtextColor} opacity={0.85} textAlign="center">
                                                    {action.description}
                                                </Text>
                                            )}
                                        </VStack>
                                    </Button>
                                );

                                return (
                                    <Box key={action.key} w="100%">
                                        {action.tooltip ? (
                                            <Tooltip label={action.tooltip} placement="top" hasArrow>
                                                <Box w="100%">
                                                    {card}
                                                </Box>
                                            </Tooltip>
                                        ) : (
                                            card
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
}
