import {
    Box,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Progress,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip,
    Divider
} from "@chakra-ui/react";
import { FiMapPin, FiUsers, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function GeographicInsights({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // Функция для нормализации названий городов
    const normalizeCity = (city) => {
        if (!city) return "Не указан";

        const normalized = city.toString().trim();

        // Приводим к единому формату
        const cityMappings = {
            'спб': 'Санкт-Петербург',
            'санкт-петербург': 'Санкт-Петербург',
            'петербург': 'Санкт-Петербург',
            'ленинград': 'Санкт-Петербург',
            'питер': 'Санкт-Петербург',
            'москва': 'Москва',
            'мск': 'Москва',
            'московская область': 'Московская область',
            'мо': 'Московская область',
            'екатеринбург': 'Екатеринбург',
            'екб': 'Екатеринбург',
            'новосибирск': 'Новосибирск',
            'нск': 'Новосибирск',
            'казань': 'Казань',
            'нижний новгород': 'Нижний Новгород',
            'н.новгород': 'Нижний Новгород',
            'ростов-на-дону': 'Ростов-на-Дону',
            'ростов': 'Ростов-на-Дону',
            'красноярск': 'Красноярск',
            'самара': 'Самара',
            'волгоград': 'Волгоград',
            'воронеж': 'Воронеж',
            'пермь': 'Пермь',
            'краснодар': 'Краснодар',
            'тюмень': 'Тюмень',
            'иркутск': 'Иркутск',
            'барнаул': 'Барнаул',
            'ульяновск': 'Ульяновск',
            'владивосток': 'Владивосток',
            'ярославль': 'Ярославль',
            'томск': 'Томск',
            'оренбург': 'Оренбург',
            'новокузнецк': 'Новокузнецк',
            'кемерово': 'Кемерово',
            'рязань': 'Рязань',
            'астрахань': 'Астрахань',
            'набережные челны': 'Набережные Челны',
            'пенза': 'Пенза',
            'липецк': 'Липецк',
            'тула': 'Тула',
            'киров': 'Киров',
            'чебоксары': 'Чебоксары',
            'калининград': 'Калининград',
            'брянск': 'Брянск',
            'курск': 'Курск',
            'иваново': 'Иваново',
            'магнитогорск': 'Магнитогорск',
            'тверь': 'Тверь',
            'ставрополь': 'Ставрополь',
            'нижний тагил': 'Нижний Тагил',
            'белгород': 'Белгород',
            'архангельск': 'Архангельск',
            'владимир': 'Владимир',
            'сочи': 'Сочи',
            'курган': 'Курган',
            'орел': 'Орел',
            'смоленск': 'Смоленск',
            'на волге': 'Поволжье',
            'волга': 'Поволжье',
            'россия': 'Россия (общее)',
            'рф': 'Россия (общее)',
            'вернуласьчитаю': 'Не указан', // из данных
        };

        const lower = normalized.toLowerCase();
        return cityMappings[lower] || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    };

    // Обработка географических данных
    const cityStats = {};
    data.forEach(review => {
        const city = normalizeCity(review.city);
        if (!cityStats[city]) {
            cityStats[city] = {
                count: 0,
                positive: 0,
                negative: 0,
                avgRating: 0,
                totalRating: 0,
                ratings: []
            };
        }

        cityStats[city].count++;

        // Подсчет настроений
        if (review.sentiments?.includes("положительно")) {
            cityStats[city].positive++;
        }
        if (review.sentiments?.includes("отрицательно")) {
            cityStats[city].negative++;
        }

        // Рейтинги
        const rating = parseInt(review.rating) || 0;
        if (rating > 0) {
            cityStats[city].ratings.push(rating);
            cityStats[city].totalRating += rating;
        }
    });

    // Вычисляем средние рейтинги
    Object.keys(cityStats).forEach(city => {
        const stats = cityStats[city];
        stats.avgRating = stats.ratings.length > 0
            ? (stats.totalRating / stats.ratings.length).toFixed(1)
            : 0;
    });

    // Сортируем города по количеству отзывов
    const sortedCities = Object.entries(cityStats)
        .filter(([city, stats]) => stats.count >= 2) // Только города с 2+ отзывами
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 8);

    // Статистика
    const totalCities = Object.keys(cityStats).length;
    const mostActiveCities = sortedCities.slice(0, 3);

    // Лучший и худший город по настроениям
    const citiesByPositivity = sortedCities
        .map(([city, stats]) => ({
            city,
            positivityRate: stats.count > 0 ? (stats.positive / stats.count * 100) : 0,
            count: stats.count
        }))
        .sort((a, b) => b.positivityRate - a.positivityRate);

    const bestCity = citiesByPositivity[0];
    const worstCity = citiesByPositivity[citiesByPositivity.length - 1];

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
                    Географическая аналитика
                </Text>

                {/* Общая статистика */}
                <SimpleGrid columns={3} spacing={4}>
                    <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                            {totalCities}
                        </Text>
                        <Text fontSize="sm" color="gray.600">городов</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {bestCity?.city || "—"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">лучший рейтинг</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="red.500">
                            {worstCity?.city || "—"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">требует внимания</Text>
                    </Box>
                </SimpleGrid>

                <Divider />

                {/* Детализация по городам */}
                <VStack align="stretch" spacing={4}>
                    <Text fontSize="md" fontWeight="semibold">
                        Активность по регионам
                    </Text>

                    {sortedCities.map(([city, stats]) => {
                        const positivityRate = (stats.positive / stats.count * 100).toFixed(1);
                        const negativityRate = (stats.negative / stats.count * 100).toFixed(1);

                        return (
                            <Box key={city}>
                                <HStack justify="space-between" mb={2}>
                                    <HStack>
                                        <Icon as={FiMapPin} color="brand.500" boxSize={4} />
                                        <Text fontSize="sm" fontWeight="semibold">
                                            {city}
                                        </Text>
                                        {parseFloat(negativityRate) > 70 && (
                                            <Tooltip label="Высокий уровень негатива">
                                                <Icon as={FiTrendingDown} color="red.500" boxSize={4} />
                                            </Tooltip>
                                        )}
                                        {parseFloat(positivityRate) > 70 && (
                                            <Tooltip label="Высокий уровень позитива">
                                                <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
                                            </Tooltip>
                                        )}
                                    </HStack>

                                    <HStack spacing={3}>
                                        <Badge colorScheme="blue" variant="outline" fontSize="xs">
                                            <Icon as={FiUsers} mr={1} />
                                            {stats.count}
                                        </Badge>
                                        <Badge
                                            colorScheme={stats.avgRating >= 3 ? "green" : "red"}
                                            variant="subtle"
                                            fontSize="xs"
                                        >
                                            ⭐ {stats.avgRating}
                                        </Badge>
                                        <Badge
                                            colorScheme={parseFloat(positivityRate) > 50 ? "green" : "red"}
                                            variant="subtle"
                                            fontSize="xs"
                                        >
                                            {positivityRate}% 👍
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
                                        w={`${positivityRate}%`}
                                        bg="green.400"
                                        borderRadius="full"
                                    />
                                </Progress>
                            </Box>
                        );
                    })}
                </VStack>

                {/* Инсайты и рекомендации */}
                {(bestCity && worstCity && bestCity.city !== worstCity.city) && (
                    <Box mt={4} p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                        <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
                            📍 Географические инсайты
                        </Text>
                        <Text fontSize="xs" color="blue.600">
                            <strong>{bestCity.city}</strong> показывает {bestCity.positivityRate.toFixed(1)}% позитивных отзывов,
                            в то время как <strong>{worstCity.city}</strong> имеет только {worstCity.positivityRate.toFixed(1)}%.
                            Рекомендуется изучить лучшие практики из {bestCity.city}.
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}