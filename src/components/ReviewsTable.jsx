import {
    Box,
    Text,
    VStack,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    useColorModeValue,
    Icon,
    Tooltip,
    Avatar,
    Wrap,
    WrapItem,
    Link
} from "@chakra-ui/react";
import { useState } from "react";
import { FiExternalLink, FiCalendar, FiMapPin, FiStar } from "react-icons/fi";

export default function ReviewsTable({ reviews, maxShow = 10 }) {
    const [showMore, setShowMore] = useState(false);
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const displayReviews = showMore ? reviews : reviews.slice(0, maxShow);

    const getSentimentColor = (sentiments) => {
        if (!sentiments || sentiments.length === 0) return "gray";
        const hasPositive = sentiments.includes("положительно");
        const hasNegative = sentiments.includes("отрицательно");

        if (hasPositive && !hasNegative) return "green";
        if (hasNegative && !hasPositive) return "red";
        return "yellow";
    };

    const getRatingStars = (rating) => {
        const stars = [];
        const numRating = parseInt(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={i}
                    as={FiStar}
                    color={i <= numRating ? "yellow.400" : "gray.300"}
                    fill={i <= numRating ? "yellow.400" : "transparent"}
                    boxSize={3}
                />
            );
        }
        return stars;
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Нет даты";
        try {
            return new Date(dateStr).toLocaleDateString('ru-RU');
        } catch {
            return dateStr;
        }
    };

    return (
        <Box
            bg={bgColor}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            shadow="lg"
            overflow="hidden"
        >
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
                <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Детальный обзор отзывов
                    </Text>
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        {reviews.length} отзывов
                    </Badge>
                </HStack>
            </Box>

            <Box overflowX="auto">
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr bg={useColorModeValue("gray.50", "gray.700")}>
                            <Th>Отзыв</Th>
                            <Th>Рейтинг</Th>
                            <Th>Темы</Th>
                            <Th>Настроение</Th>
                            <Th>Дата</Th>
                            <Th>Город</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {displayReviews.map((review, index) => (
                            <Tr key={review.id || index} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                                <Td maxW="300px">
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                                            {review.title || "Без заголовка"}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                            {truncateText(review.text)}
                                        </Text>
                                    </VStack>
                                </Td>

                                <Td>
                                    <HStack>
                                        {getRatingStars(review.rating)}
                                    </HStack>
                                </Td>

                                <Td>
                                    <Wrap spacing={1} maxW="200px">
                                        {(review.topics || []).slice(0, 3).map((topic, i) => (
                                            <WrapItem key={i}>
                                                <Badge
                                                    size="sm"
                                                    colorScheme="blue"
                                                    variant="subtle"
                                                    fontSize="xs"
                                                >
                                                    {topic}
                                                </Badge>
                                            </WrapItem>
                                        ))}
                                        {(review.topics || []).length > 3 && (
                                            <Badge size="sm" variant="outline" fontSize="xs">
                                                +{(review.topics || []).length - 3}
                                            </Badge>
                                        )}
                                    </Wrap>
                                </Td>

                                <Td>
                                    <Badge
                                        colorScheme={getSentimentColor(review.sentiments)}
                                        variant="subtle"
                                        px={2}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                    >
                                        {review.sentiments?.[0] || "неизвестно"}
                                    </Badge>
                                </Td>

                                <Td>
                                    <HStack>
                                        <Icon as={FiCalendar} color="gray.400" boxSize={3} />
                                        <Text fontSize="xs">{formatDate(review.date)}</Text>
                                    </HStack>
                                </Td>

                                <Td>
                                    <HStack>
                                        <Icon as={FiMapPin} color="gray.400" boxSize={3} />
                                        <Text fontSize="xs">{review.city || "Не указан"}</Text>
                                    </HStack>
                                </Td>

                                <Td>
                                    {review.link && (
                                        <Tooltip label="Открыть оригинальный отзыв">
                                            <Button as={Link} href={review.link} isExternal size="xs" variant="ghost">
                                                <Icon as={FiExternalLink} />
                                            </Button>
                                        </Tooltip>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {reviews.length > maxShow && (
                <Box p={4} textAlign="center" borderTop="1px" borderColor={borderColor}>
                    <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="brand"
                        onClick={() => setShowMore(!showMore)}
                    >
                        {showMore ? `Показать меньше` : `Показать еще ${reviews.length - maxShow} отзывов`}
                    </Button>
                </Box>
            )}
        </Box>
    );
}