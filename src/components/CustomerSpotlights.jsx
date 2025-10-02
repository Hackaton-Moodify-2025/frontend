import {
    Box,
    VStack,
    HStack,
    Text,
    Icon,
    Badge,
    useColorModeValue,
    Button,
    Avatar,
    Divider,
    SimpleGrid,
    Tooltip,
    Tag,
    TagLabel
} from "@chakra-ui/react";
import { FiHeart, FiThumbsDown, FiClock, FiMapPin, FiExternalLink } from "react-icons/fi";
import { useMemo } from "react";

const parseRating = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const pickReview = (reviews, comparator) => {
    const sorted = [...reviews].sort(comparator);
    return sorted.find((review) => review.text && review.text.length > 120) || sorted[0] || null;
};

const truncate = (text, limit = 240) => {
    if (!text) return "";
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

const ReviewCard = ({
    title,
    badge,
    icon,
    colorScheme,
    review,
    onQuickFilter
}) => {
    const bg = useColorModeValue("white", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const subtextColor = useColorModeValue("gray.600", "gray.400");
    const iconBg = useColorModeValue("gray.100", "gray.700");

    if (!review) {
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
                <VStack spacing={4} align="center" justify="center" h="100%">
                    <Badge colorScheme="gray" variant="subtle">
                        Недостаточно данных
                    </Badge>
                    <Text fontSize="sm" color={subtextColor} textAlign="center">
                        Измените фильтры, чтобы увидеть живые истории клиентов.
                    </Text>
                </VStack>
            </Box>
        );
    }

    const rating = parseRating(review.rating);

    return (
        <Box
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            p={6}
            bg={bg}
            shadow="lg"
            display="flex"
            flexDirection="column"
            h="100%"
        >
            <VStack align="stretch" spacing={4} flex="1">
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
                            <Badge colorScheme={colorScheme} variant="subtle">
                                {badge}
                            </Badge>
                        </VStack>
                    </HStack>
                    <Avatar name={review.author || review.city || "Клиент"} size="sm" />
                </HStack>
                <VStack align="flex-start" spacing={2}>
                    <Text fontSize="sm" color={subtextColor}>
                        {review.date ? new Date(review.date).toLocaleDateString("ru-RU") : "Дата не указана"}
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                        {review.title || "Без названия"}
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                        {truncate(review.text)}
                    </Text>
                </VStack>
                <VStack align="flex-start" spacing={2} mt={2}>
                    <HStack spacing={2}>
                        {typeof rating === "number" && (
                            <Badge colorScheme={colorScheme === "red" ? "red" : "green"}>
                                {rating.toFixed(1)} ★
                            </Badge>
                        )}
                        {review.city && (
                            <Tag size="sm" colorScheme="gray" borderRadius="full">
                                <Icon as={FiMapPin} style={{ marginRight: 4 }} />
                                <TagLabel>{review.city}</TagLabel>
                            </Tag>
                        )}
                        {review.topics?.slice(0, 2).map((topic) => (
                            <Tag key={topic} size="sm" colorScheme="brand" variant="subtle" borderRadius="full">
                                <TagLabel>{topic}</TagLabel>
                            </Tag>
                        ))}
                    </HStack>
                </VStack>
                <Divider my={2} />
                <HStack justify="space-between" align="center" spacing={3}>
                    <Tooltip
                        label={review.link ? "Открыть оригинал отзыва" : "Ссылка недоступна"}
                        placement="top"
                        shouldWrapChildren
                    >
                        <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="brand"
                            rightIcon={<Icon as={FiExternalLink} />}
                            as="a"
                            href={review.link || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            isDisabled={!review.link}
                        >
                            К оригиналу
                        </Button>
                    </Tooltip>
                    <Text fontSize="xs" color={subtextColor}>
                        ID #{review.id}
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
};

export default function CustomerSpotlights({ data, onQuickFilter, hasRecentData, latestReviewDate }) {
    const subtextColor = useColorModeValue("gray.600", "gray.400");
    const isHistorical = !hasRecentData;
    const lastReviewLabel = latestReviewDate
        ? latestReviewDate.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        : null;

    const { promoters, detractors, fastFeedback } = useMemo(() => {
        if (!data?.length) {
            return { promoters: null, detractors: null, fastFeedback: null };
        }

        const withRating = data.filter((review) => parseRating(review.rating) != null);
        const promotersPool = withRating.filter((review) => parseRating(review.rating) >= 4);
        const detractorsPool = withRating.filter((review) => parseRating(review.rating) <= 2);

        const newest = pickReview(
            data.filter((review) => review.text),
            (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        );

        return {
            promoters: pickReview(promotersPool, (a, b) => parseRating(b.rating) - parseRating(a.rating)),
            detractors: pickReview(detractorsPool, (a, b) => parseRating(a.rating) - parseRating(b.rating)),
            fastFeedback: newest
        };
    }, [data]);

    return (
        <VStack align="stretch" spacing={4}>
            <VStack align="flex-start" spacing={1}>
                <HStack spacing={3}>
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Голоса клиентов: моментальные истории
                    </Text>
                    <Badge colorScheme={isHistorical ? "gray" : "brand"} variant="subtle" borderRadius="full">
                        {isHistorical ? "Исторический период" : "Активный период"}
                    </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                    Автоматический подбор ярких отзывов: от восторгов до критики и свежих сигналов
                </Text>
                {isHistorical && (
                    <Text fontSize="xs" color={subtextColor}>
                        Последний доступный отзыв: {lastReviewLabel || "нет данных"}. Карточки показывают исторические истории.
                    </Text>
                )}
            </VStack>
            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
                <ReviewCard
                    title="Топовый отзыв"
                    badge="Высокая оценка"
                    icon={FiHeart}
                    colorScheme="green"
                    review={promoters}
                    onQuickFilter={onQuickFilter}
                />
                <ReviewCard
                    title="Режим FIRE"
                    badge="Сильная боль клиента"
                    icon={FiThumbsDown}
                    colorScheme="red"
                    review={detractors}
                    onQuickFilter={onQuickFilter}
                />
                <ReviewCard
                    title="Моментальный сигнал"
                    badge="Свежий отзыв"
                    icon={FiClock}
                    colorScheme="blue"
                    review={fastFeedback}
                    onQuickFilter={onQuickFilter}
                />
            </SimpleGrid>
        </VStack>
    );
}
