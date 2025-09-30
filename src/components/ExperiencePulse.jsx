import {
    Box,
    SimpleGrid,
    VStack,
    HStack,
    Text,
    Icon,
    Badge,
    useColorModeValue,
    Tooltip,
    Progress
} from "@chakra-ui/react";
import {
    FiActivity,
    FiSmile,
    FiFrown,
    FiStar,
    FiArrowUpRight,
    FiArrowDownRight,
    FiArchive
} from "react-icons/fi";
import { useMemo } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    Tooltip as RechartsTooltip
} from "recharts";

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeRating = (rating) => {
    if (rating == null) return null;
    if (typeof rating === "number") return rating;
    if (typeof rating === "string") {
        const parsed = parseFloat(rating.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const getBoundaryDate = (daysAgo) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    return date;
};

const formatDayLabel = (date) =>
    date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit"
    });

const computeDailyStats = (data, horizon) => {
    const map = new Map();

    data.forEach((review) => {
        const date = parseDate(review.date);
        if (!date) return;

        const dayKey = date.toISOString().split("T")[0];
        if (!map.has(dayKey)) {
            map.set(dayKey, {
                volume: 0,
                positive: 0,
                negative: 0,
                ratingSum: 0,
                ratingCount: 0
            });
        }

        const bucket = map.get(dayKey);
        bucket.volume += 1;
        if (review.sentiments?.includes("положительно")) bucket.positive += 1;
        if (review.sentiments?.includes("отрицательно")) bucket.negative += 1;
        const rating = normalizeRating(review.rating);
        if (rating != null) {
            bucket.ratingSum += rating;
            bucket.ratingCount += 1;
        }
    });

    const days = [];
    for (let i = horizon - 1; i >= 0; i -= 1) {
        const day = getBoundaryDate(i);
        const key = day.toISOString().split("T")[0];
        const stats = map.get(key);
        if (stats) {
            days.push({
                date: formatDayLabel(day),
                volume: stats.volume,
                positiveRate: stats.volume ? (stats.positive / stats.volume) * 100 : 0,
                negativeRate: stats.volume ? (stats.negative / stats.volume) * 100 : 0,
                avgRating: stats.ratingCount ? stats.ratingSum / stats.ratingCount : 0
            });
        } else {
            days.push({
                date: formatDayLabel(day),
                volume: 0,
                positiveRate: 0,
                negativeRate: 0,
                avgRating: 0
            });
        }
    }

    return days;
};

const computeChange = (current, previous) => {
    if (previous === 0) {
        if (current === 0) return { value: 0, trend: "neutral" };
        return { value: 100, trend: "up" };
    }
    const diff = ((current - previous) / previous) * 100;
    if (diff > 2) return { value: diff, trend: "up" };
    if (diff < -2) return { value: diff, trend: "down" };
    return { value: diff, trend: "neutral" };
};

const metricConfig = [
    {
        key: "volume",
        label: "Импульс обратной связи",
        description: "Количество отзывов за последние 30 дней",
        icon: FiActivity,
        positive: true,
        valueFormatter: (value) => value.toLocaleString("ru-RU")
    },
    {
        key: "positiveRate",
        label: "Доля промоутеров",
        description: "Положительные эмоции в процентах",
        icon: FiSmile,
        positive: true,
        valueFormatter: (value) => `${value.toFixed(1)}%`
    },
    {
        key: "negativeRate",
        label: "Риск потерь",
        description: "Доля негативных отзывов",
        icon: FiFrown,
        positive: false,
        valueFormatter: (value) => `${value.toFixed(1)}%`
    },
    {
        key: "avgRating",
        label: "Средний рейтинг",
        description: "Интегральное качество сервиса",
        icon: FiStar,
        positive: true,
        valueFormatter: (value) => value.toFixed(2)
    }
];

const TrendBadge = ({ trend, value }) => {
    if (trend === "neutral") {
        return (
            <Badge colorScheme="gray" variant="subtle">
                {value.toFixed(1)}%
            </Badge>
        );
    }

    const IconComponent = trend === "up" ? FiArrowUpRight : FiArrowDownRight;
    const colorScheme = trend === "up" ? "green" : "red";

    return (
        <Badge colorScheme={colorScheme} variant="solid" display="inline-flex" alignItems="center" gap={1}>
            <Icon as={IconComponent} />
            {value.toFixed(1)}%
        </Badge>
    );
};

const Sparkline = ({ data, dataKey, color }) => {
    const stroke = color;
    const fillGradientId = `${dataKey}-gradient`;

    return (
        <Box h="70px" mt={3}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
                            <stop offset="98%" stopColor={stroke} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide tickLine={false} axisLine={false} />
                    <RechartsTooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value) => (dataKey.includes("Rate") ? `${value.toFixed(1)}%` : value)}
                    />
                    <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={`url(#${fillGradientId})`} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default function ExperiencePulse({ data, hasRecentData }) {
    const cardBg = useColorModeValue("white", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtextColor = useColorModeValue("gray.600", "gray.400");
    const iconBg = useColorModeValue("gray.100", "gray.700");

    const slices = useMemo(() => {
        if (!data?.length) {
            return {
                lastPeriod: { volume: 0, positiveRate: 0, negativeRate: 0, avgRating: 0 },
                previousPeriod: { volume: 0, positiveRate: 0, negativeRate: 0, avgRating: 0 },
                trendSeries: []
            };
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const lastBoundary = getBoundaryDate(30);
        const previousBoundary = getBoundaryDate(60);

        const last = [];
        const prev = [];

        data.forEach((review) => {
            const date = parseDate(review.date);
            if (!date) return;
            if (date >= lastBoundary) {
                last.push(review);
            } else if (date >= previousBoundary && date < lastBoundary) {
                prev.push(review);
            }
        });

        const summarize = (reviews) => {
            const total = reviews.length;
            if (!total) {
                return { volume: 0, positiveRate: 0, negativeRate: 0, avgRating: 0 };
            }

            const positive = reviews.filter((item) => item.sentiments?.includes("положительно")).length;
            const negative = reviews.filter((item) => item.sentiments?.includes("отрицательно")).length;
            const ratings = reviews
                .map((item) => normalizeRating(item.rating))
                .filter((value) => value != null);

            const avgRating = ratings.length
                ? ratings.reduce((acc, value) => acc + value, 0) / ratings.length
                : 0;

            return {
                volume: total,
                positiveRate: (positive / total) * 100,
                negativeRate: (negative / total) * 100,
                avgRating
            };
        };

        return {
            lastPeriod: summarize(last),
            previousPeriod: summarize(prev),
            trendSeries: computeDailyStats(data, 14)
        };
    }, [data]);

    return (
        <Box>
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                    <VStack align="flex-start" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Пульс опыта клиентов
                        </Text>
                        <Text fontSize="sm" color={subtextColor}>
                            Сравнение последних 30 дней с предыдущими, плюс микродинамика за 14 дней
                        </Text>
                    </VStack>
                    <Badge colorScheme={hasRecentData ? "brand" : "gray"} variant="subtle">
                        {hasRecentData ? "Реальное время" : "Исторический период"}
                    </Badge>
                </HStack>
                {hasRecentData ? (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
                        {metricConfig.map((metric) => {
                            const currentValue = slices.lastPeriod[metric.key] || 0;
                            const previousValue = slices.previousPeriod[metric.key] || 0;
                            const change = computeChange(currentValue, previousValue);

                            const isPositiveTrend = metric.positive ? change.trend !== "down" : change.trend === "down";
                            const progressValue = metric.key.includes("Rate")
                                ? Math.min(Math.abs(currentValue), 100)
                                : metric.key === "avgRating"
                                    ? Math.min((currentValue / 5) * 100, 100)
                                    : Math.min((currentValue / Math.max(currentValue + previousValue, 1)) * 100, 100);

                            const sparklineColor = metric.positive
                                ? (isPositiveTrend ? "#27AE60" : "#F39C12")
                                : (isPositiveTrend ? "#27AE60" : "#C0392B");

                            return (
                                <Box
                                    key={metric.key}
                                    bg={cardBg}
                                    borderRadius="2xl"
                                    border="1px"
                                    borderColor={borderColor}
                                    p={5}
                                    shadow="lg"
                                    transition="transform 0.3s ease"
                                    _hover={{ transform: "translateY(-4px)" }}
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
                                                    <Icon as={metric.icon} color="brand.500" />
                                                </Box>
                                                <VStack align="flex-start" spacing={0}>
                                                    <Text fontWeight="semibold" fontSize="sm">
                                                        {metric.label}
                                                    </Text>
                                                    <Tooltip label={metric.description} placement="top-start">
                                                        <Text fontSize="xs" color={subtextColor}>
                                                            {metric.description}
                                                        </Text>
                                                    </Tooltip>
                                                </VStack>
                                            </HStack>
                                            <TrendBadge trend={change.trend} value={change.value} />
                                        </HStack>
                                        <VStack align="flex-start" spacing={2}>
                                            <Text fontSize="2xl" fontWeight="bold">
                                                {metric.valueFormatter(currentValue)}
                                            </Text>
                                            <Progress
                                                value={progressValue}
                                                borderRadius="full"
                                                size="sm"
                                                colorScheme={isPositiveTrend ? "green" : "red"}
                                            />
                                        </VStack>
                                        <Sparkline
                                            data={slices.trendSeries}
                                            dataKey={metric.key}
                                            color={sparklineColor}
                                        />
                                    </VStack>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <Box
                        bg={cardBg}
                        borderRadius="2xl"
                        border="1px"
                        borderColor={borderColor}
                        p={8}
                        shadow="lg"
                    >
                        <VStack spacing={3} align="center">
                            <Icon as={FiArchive} boxSize={8} color="brand.500" />
                            <Text fontWeight="semibold" textAlign="center">
                                Нет свежих отзывов за последние 30 дней
                            </Text>
                            <Text fontSize="sm" color={subtextColor} textAlign="center" maxW="520px">
                                Модуль "Пульс опыта" доступен для периодов с живыми данными. Выберите более свежий диапазон или переключитесь на другие блоки аналитики для изучения исторической динамики.
                            </Text>
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}
