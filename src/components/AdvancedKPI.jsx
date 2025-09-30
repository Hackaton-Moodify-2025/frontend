import {
    Box,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    useColorModeValue,
    Icon,
    Badge,
    Progress,
    Tooltip
} from "@chakra-ui/react";
import {
    FiActivity,
    FiTrendingUp,
    FiTrendingDown,
    FiAlertCircle,
    FiUsers,
    FiMessageSquare,
    FiStar,
    FiMapPin
} from "react-icons/fi";

export default function AdvancedKPI({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Расчет KPI
    const totalReviews = data.length;

    // Средний рейтинг
    const validRatings = data
        .map(r => parseInt(r.rating))
        .filter(r => !isNaN(r) && r > 0);
    const avgRating = validRatings.length > 0
        ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
        : 0;

    // Распределение настроений
    const sentimentStats = {
        positive: data.filter(r => r.sentiments?.includes("положительно")).length,
        negative: data.filter(r => r.sentiments?.includes("отрицательно")).length,
        neutral: data.filter(r => r.sentiments?.includes("нейтрально")).length
    };

    // Индекс удовлетворенности клиентов (Customer Satisfaction Index)
    const csi = totalReviews > 0
        ? ((sentimentStats.positive - sentimentStats.negative) / totalReviews * 100).toFixed(1)
        : 0;

    // Net Promoter Score (упрощенная версия на основе рейтингов)
    const promoters = validRatings.filter(r => r >= 4).length;
    const detractors = validRatings.filter(r => r <= 2).length;
    const nps = validRatings.length > 0
        ? (((promoters - detractors) / validRatings.length) * 100).toFixed(1)
        : 0;

    // Самые активные темы
    const topicsCount = {};
    data.forEach(review => {
        review.topics?.forEach(topic => {
            topicsCount[topic] = (topicsCount[topic] || 0) + 1;
        });
    });
    const topTopics = Object.entries(topicsCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    // Проблемные области (темы с высоким негативом)
    const problematicTopics = {};
    data.forEach(review => {
        review.topics?.forEach((topic, index) => {
            if (!problematicTopics[topic]) {
                problematicTopics[topic] = { total: 0, negative: 0 };
            }
            problematicTopics[topic].total++;
            if (review.sentiments?.[index] === "отрицательно") {
                problematicTopics[topic].negative++;
            }
        });
    });

    const criticalTopics = Object.entries(problematicTopics)
        .map(([topic, stats]) => ({
            topic,
            negativePercent: (stats.negative / stats.total * 100).toFixed(1),
            count: stats.total
        }))
        .filter(item => item.count >= 5 && parseFloat(item.negativePercent) > 50)
        .sort((a, b) => parseFloat(b.negativePercent) - parseFloat(a.negativePercent));

    // Активность по городам
    const cityCount = {};
    data.forEach(review => {
        const city = review.city || "Не указан";
        cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const topCities = Object.entries(cityCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const getKPIColor = (value, type) => {
        switch (type) {
            case 'csi':
                if (value > 20) return 'green';
                if (value > 0) return 'yellow';
                return 'red';
            case 'nps':
                if (value > 50) return 'green';
                if (value > 0) return 'yellow';
                return 'red';
            case 'rating':
                if (value >= 4) return 'green';
                if (value >= 3) return 'yellow';
                return 'red';
            default:
                return 'blue';
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
            <VStack align="stretch" spacing={6}>
                <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Продвинутая аналитика KPI
                    </Text>
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        <Icon as={FiActivity} mr={1} />
                        Live Dashboard
                    </Badge>
                </HStack>

                {/* Основные KPI */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                        <StatLabel fontSize="xs" color="gray.500">
                            <Icon as={FiMessageSquare} mr={1} />
                            Всего отзывов
                        </StatLabel>
                        <StatNumber color="brand.500" fontSize="xl">
                            {totalReviews}
                        </StatNumber>
                        <StatHelpText>
                            <StatArrow type="increase" />
                            Активность высокая
                        </StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs" color="gray.500">
                            <Icon as={FiStar} mr={1} />
                            Средний рейтинг
                        </StatLabel>
                        <StatNumber color={`${getKPIColor(avgRating, 'rating')}.500`} fontSize="xl">
                            {avgRating}⭐
                        </StatNumber>
                        <StatHelpText>
                            <StatArrow type={avgRating >= 3 ? "increase" : "decrease"} />
                            из 5.0
                        </StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs" color="gray.500">
                            <Icon as={FiTrendingUp} mr={1} />
                            Индекс CSI
                        </StatLabel>
                        <StatNumber color={`${getKPIColor(csi, 'csi')}.500`} fontSize="xl">
                            {csi}%
                        </StatNumber>
                        <StatHelpText>
                            <StatArrow type={csi > 0 ? "increase" : "decrease"} />
                            удовлетворенность
                        </StatHelpText>
                    </Stat>

                    <Stat>
                        <StatLabel fontSize="xs" color="gray.500">
                            <Icon as={FiUsers} mr={1} />
                            Net Promoter Score
                        </StatLabel>
                        <StatNumber color={`${getKPIColor(nps, 'nps')}.500`} fontSize="xl">
                            {nps}
                        </StatNumber>
                        <StatHelpText>
                            <StatArrow type={nps > 0 ? "increase" : "decrease"} />
                            лояльность
                        </StatHelpText>
                    </Stat>
                </SimpleGrid>

                {/* Распределение настроений */}
                <Box>
                    <Text fontSize="md" fontWeight="semibold" mb={3}>
                        Распределение эмоций клиентов
                    </Text>
                    <SimpleGrid columns={3} spacing={4}>
                        <VStack>
                            <Progress
                                value={(sentimentStats.positive / totalReviews) * 100}
                                colorScheme="green"
                                size="lg"
                                w="100%"
                                borderRadius="full"
                            />
                            <HStack>
                                <Text fontSize="sm" fontWeight="bold" color="green.500">
                                    {sentimentStats.positive}
                                </Text>
                                <Text fontSize="xs" color="gray.500">позитивных</Text>
                            </HStack>
                        </VStack>

                        <VStack>
                            <Progress
                                value={(sentimentStats.neutral / totalReviews) * 100}
                                colorScheme="gray"
                                size="lg"
                                w="100%"
                                borderRadius="full"
                            />
                            <HStack>
                                <Text fontSize="sm" fontWeight="bold" color="gray.500">
                                    {sentimentStats.neutral}
                                </Text>
                                <Text fontSize="xs" color="gray.500">нейтральных</Text>
                            </HStack>
                        </VStack>

                        <VStack>
                            <Progress
                                value={(sentimentStats.negative / totalReviews) * 100}
                                colorScheme="red"
                                size="lg"
                                w="100%"
                                borderRadius="full"
                            />
                            <HStack>
                                <Text fontSize="sm" fontWeight="bold" color="red.500">
                                    {sentimentStats.negative}
                                </Text>
                                <Text fontSize="xs" color="gray.500">негативных</Text>
                            </HStack>
                        </VStack>
                    </SimpleGrid>
                </Box>

                {/* Топ темы и проблемы */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Популярные темы */}
                    <Box>
                        <Text fontSize="md" fontWeight="semibold" mb={3}>
                            Топ обсуждаемых тем
                        </Text>
                        <VStack spacing={2}>
                            {topTopics.map(([topic, count], index) => (
                                <HStack key={topic} w="100%" justify="space-between">
                                    <HStack>
                                        <Badge colorScheme="blue" variant="solid" borderRadius="full" w="20px" h="20px" display="flex" alignItems="center" justifyContent="center" fontSize="xs">
                                            {index + 1}
                                        </Badge>
                                        <Text fontSize="sm">{topic}</Text>
                                    </HStack>
                                    <Badge colorScheme="blue" variant="subtle">
                                        {count}
                                    </Badge>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    {/* Проблемные области */}
                    <Box>
                        <Text fontSize="md" fontWeight="semibold" mb={3}>
                            <Icon as={FiAlertCircle} color="red.500" mr={2} />
                            Требуют внимания
                        </Text>
                        <VStack spacing={2}>
                            {criticalTopics.slice(0, 3).map((item, index) => (
                                <HStack key={item.topic} w="100%" justify="space-between">
                                    <HStack>
                                        <Icon as={FiAlertCircle} color="red.500" />
                                        <Text fontSize="sm">{item.topic}</Text>
                                    </HStack>
                                    <Tooltip label={`${item.count} отзывов, ${item.negativePercent}% негатива`}>
                                        <Badge colorScheme="red" variant="solid">
                                            {item.negativePercent}%
                                        </Badge>
                                    </Tooltip>
                                </HStack>
                            ))}
                            {criticalTopics.length === 0 && (
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    Критических проблем не выявлено
                                </Text>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>

                {/* Географическая активность */}
                <Box>
                    <Text fontSize="md" fontWeight="semibold" mb={3}>
                        <Icon as={FiMapPin} color="brand.500" mr={2} />
                        Активные регионы
                    </Text>
                    <HStack spacing={4}>
                        {topCities.map(([city, count]) => (
                            <Badge key={city} colorScheme="brand" variant="subtle" px={3} py={1} borderRadius="full">
                                {city}: {count}
                            </Badge>
                        ))}
                    </HStack>
                </Box>
            </VStack>
        </Box>
    );
}