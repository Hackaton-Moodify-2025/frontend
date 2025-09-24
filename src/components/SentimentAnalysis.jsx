import {
    Box,
    Text,
    VStack,
    HStack,
    Progress,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip
} from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

export default function SentimentAnalysis({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Обработка данных
    const totalReviews = data.length;
    const sentimentCounts = {
        положительно: data.filter(item => item.sentiments?.includes("положительно")).length,
        нейтрально: data.filter(item => item.sentiments?.includes("нейтрально")).length,
        отрицательно: data.filter(item => item.sentiments?.includes("отрицательно")).length,
    };

    const sentimentPercentages = {
        положительно: totalReviews ? (sentimentCounts.положительно / totalReviews * 100).toFixed(1) : 0,
        нейтрально: totalReviews ? (sentimentCounts.нейтрально / totalReviews * 100).toFixed(1) : 0,
        отрицательно: totalReviews ? (sentimentCounts.отрицательно / totalReviews * 100).toFixed(1) : 0,
    };

    // Тренд настроений (упрощенная логика)
    const positiveTrend = sentimentPercentages.положительно > 40 ? "up" :
        sentimentPercentages.положительно < 20 ? "down" : "neutral";

    const getSentimentIcon = (trend) => {
        switch (trend) {
            case "up": return FiTrendingUp;
            case "down": return FiTrendingDown;
            default: return FiMinus;
        }
    };

    const getSentimentColor = (trend) => {
        switch (trend) {
            case "up": return "green.500";
            case "down": return "red.500";
            default: return "gray.500";
        }
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
            <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Анализ настроений
                    </Text>
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        {totalReviews} отзывов
                    </Badge>
                </HStack>

                {/* Позитивные */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                                Позитивные
                            </Text>
                            <Tooltip label="Тренд позитивных отзывов">
                                <Icon
                                    as={getSentimentIcon(positiveTrend)}
                                    color={getSentimentColor(positiveTrend)}
                                    boxSize={4}
                                />
                            </Tooltip>
                        </HStack>
                        <HStack>
                            <Text fontSize="sm" color="green.500" fontWeight="bold">
                                {sentimentPercentages.положительно}%
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                ({sentimentCounts.положительно})
                            </Text>
                        </HStack>
                    </HStack>
                    <Progress
                        value={sentimentPercentages.положительно}
                        colorScheme="green"
                        size="md"
                        borderRadius="full"
                    />
                </Box>

                {/* Нейтральные */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                            Нейтральные
                        </Text>
                        <HStack>
                            <Text fontSize="sm" color="gray.500" fontWeight="bold">
                                {sentimentPercentages.нейтрально}%
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                ({sentimentCounts.нейтрально})
                            </Text>
                        </HStack>
                    </HStack>
                    <Progress
                        value={sentimentPercentages.нейтрально}
                        colorScheme="gray"
                        size="md"
                        borderRadius="full"
                    />
                </Box>

                {/* Негативные */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                                Негативные
                            </Text>
                            <Tooltip label="Требует внимания!">
                                <Icon
                                    as={FiTrendingUp}
                                    color="red.500"
                                    boxSize={4}
                                />
                            </Tooltip>
                        </HStack>
                        <HStack>
                            <Text fontSize="sm" color="red.500" fontWeight="bold">
                                {sentimentPercentages.отрицательно}%
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                ({sentimentCounts.отрицательно})
                            </Text>
                        </HStack>
                    </HStack>
                    <Progress
                        value={sentimentPercentages.отрицательно}
                        colorScheme="red"
                        size="md"
                        borderRadius="full"
                    />
                </Box>

                {/* Индекс удовлетворенности */}
                <Box mt={4} p={4} bg="brand.50" borderRadius="lg">
                    <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="semibold">
                            Индекс удовлетворенности клиентов
                        </Text>
                        <Badge
                            colorScheme={sentimentPercentages.положительно > 40 ? "green" :
                                sentimentPercentages.положительно > 25 ? "yellow" : "red"}
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                        >
                            {(sentimentPercentages.положительно - sentimentPercentages.отрицательно).toFixed(1)}%
                        </Badge>
                    </HStack>
                </Box>
            </VStack>
        </Box>
    );
}