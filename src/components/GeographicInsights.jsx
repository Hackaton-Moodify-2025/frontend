import {
    Box,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Badge,
    useColorModeValue,
    Icon,
    Tooltip,
    Divider,
    Button,
    ButtonGroup,
    Wrap,
    WrapItem,
    Tag,
    Flex
} from "@chakra-ui/react";
import {
    FiMapPin,
    FiUsers,
    FiTrendingUp,
    FiFilter,
    FiAward,
    FiAlertTriangle
} from "react-icons/fi";

const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export default function GeographicInsights({ data, onQuickFilter }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const subtleBg = useColorModeValue("gray.50", "gray.700");
    const neutralBg = useColorModeValue("gray.100", "gray.600");
    const positiveBg = useColorModeValue("green.100", "green.900");
    const negativeBg = useColorModeValue("red.100", "red.900");

    const now = new Date();
    const last30 = new Date(now.getTime());
    last30.setDate(last30.getDate() - 30);
    const prev60 = new Date(now.getTime());
    prev60.setDate(prev60.getDate() - 60);

    // Функция для нормализации названий городов
    const normalizeCity = (city) => {
        if (!city) return "Не указан";

        const normalized = city.toString().trim();

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
            'вернуласьчитаю': 'Не указан'
        };

        const lower = normalized.toLowerCase();
        return cityMappings[lower] || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    };

    const cityStats = {};
    const cityTrends = {};

    data.forEach(review => {
        const city = normalizeCity(review.city);
        if (!cityStats[city]) {
            cityStats[city] = {
                count: 0,
                positive: 0,
                negative: 0,
                totalRating: 0,
                ratings: []
            };
        }

        if (!cityTrends[city]) {
            cityTrends[city] = {
                recent: 0,
                previous: 0
            };
        }

        cityStats[city].count++;

        const date = parseDate(review.date);
        const period = !date || date >= last30 ? "recent" : (date >= prev60 ? "previous" : null);
        if (period === "recent") cityTrends[city].recent++;
        if (period === "previous") cityTrends[city].previous++;

        if (review.sentiments?.includes("положительно")) {
            cityStats[city].positive++;
        }
        if (review.sentiments?.includes("отрицательно")) {
            cityStats[city].negative++;
        }

        const rating = parseInt(review.rating, 10) || 0;
        if (rating > 0) {
            cityStats[city].ratings.push(rating);
            cityStats[city].totalRating += rating;
        }
    });

    const cityDetails = Object.entries(cityStats).map(([city, stats]) => {
        const averageRating = stats.ratings.length > 0
            ? Number((stats.totalRating / stats.ratings.length).toFixed(1))
            : 0;
        const positivePercent = stats.count ? Number(((stats.positive / stats.count) * 100).toFixed(1)) : 0;
        const negativePercent = stats.count ? Number(((stats.negative / stats.count) * 100).toFixed(1)) : 0;
        const neutralPercent = Math.max(0, Number((100 - positivePercent - negativePercent).toFixed(1)));

        return {
            city,
            ...stats,
            avgRating: averageRating,
            positivePercent,
            negativePercent,
            neutralPercent
        };
    });

    const sortedCities = cityDetails
        .filter(item => item.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const topPositiveCities = [...sortedCities]
        .sort((a, b) => b.positivePercent - a.positivePercent)
        .slice(0, 3);

    const topNegativeCities = [...sortedCities]
        .sort((a, b) => b.negativePercent - a.negativePercent)
        .slice(0, 3);

    const cityTrendDetails = Object.entries(cityTrends).map(([city, trend]) => ({
        city,
        ...trend
    }));

    const hotCities = cityTrendDetails
        .filter(item => item.recent >= 2)
        .sort((a, b) => b.recent - a.recent)
        .slice(0, 4);

    const cityTrendMap = Object.fromEntries(cityTrendDetails.map(item => [item.city, item]));

    const totalCities = cityDetails.length;
    const totalReviews = cityDetails.reduce((acc, city) => acc + city.count, 0);
    const totalPositive = cityDetails.reduce((acc, city) => acc + city.positive, 0);
    const totalNegative = cityDetails.reduce((acc, city) => acc + city.negative, 0);
    const ratingSum = cityDetails.reduce((acc, city) => acc + city.totalRating, 0);
    const ratingCount = cityDetails.reduce((acc, city) => acc + city.ratings.length, 0);

    const overallPositivity = totalReviews ? Number(((totalPositive / totalReviews) * 100).toFixed(1)) : 0;
    const overallNegativity = totalReviews ? Number(((totalNegative / totalReviews) * 100).toFixed(1)) : 0;
    const overallRating = ratingCount ? Number((ratingSum / ratingCount).toFixed(1)) : 0;

    const bestCity = topPositiveCities[0];
    const worstCity = topNegativeCities[0];

    const handleCityFilter = (cities, options) => {
        if (!onQuickFilter || !cities || cities.length === 0) return;
        onQuickFilter({ cities }, options);
    };

    const clearCityFilter = () => {
        onQuickFilter?.({ cities: [] });
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
                            Географическая аналитика
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Где концентрируются лояльные клиенты и зоны риска
                        </Text>
                    </VStack>

                    <ButtonGroup size="xs" variant="ghost" colorScheme="brand" display={{ base: "none", lg: "flex" }}>
                        <Tooltip label="Показать города с наилучшей динамикой">
                            <Button
                                leftIcon={<FiTrendingUp />}
                                onClick={() => handleCityFilter(hotCities.map(item => item.city))}
                                isDisabled={hotCities.length === 0}
                            >
                                Рост
                            </Button>
                        </Tooltip>
                        <Tooltip label="Сфокусироваться на лояльных регионах">
                            <Button
                                leftIcon={<FiAward />}
                                colorScheme="green"
                                onClick={() => handleCityFilter(topPositiveCities.map(item => item.city))}
                                isDisabled={topPositiveCities.length === 0}
                            >
                                Лидеры
                            </Button>
                        </Tooltip>
                        <Tooltip label="Выделить города с высоким негативом">
                            <Button
                                leftIcon={<FiAlertTriangle />}
                                colorScheme="red"
                                onClick={() => handleCityFilter(topNegativeCities.map(item => item.city))}
                                isDisabled={topNegativeCities.length === 0}
                            >
                                Антирейтинг
                            </Button>
                        </Tooltip>
                        <Tooltip label="Очистить фильтр по городам">
                            <Button leftIcon={<FiFilter />} onClick={clearCityFilter}>
                                Все города
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Box p={4} borderRadius="lg" bg={subtleBg}>
                        <Text fontSize="xs" color="gray.500">География</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">{totalCities}</Text>
                        <Text fontSize="xs" color="gray.500">активных локаций</Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={subtleBg}>
                        <Text fontSize="xs" color="gray.500">Отзывы</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">{totalReviews}</Text>
                        <Text fontSize="xs" color="gray.500">за выбранный период</Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={subtleBg}>
                        <Text fontSize="xs" color="gray.500">Средний рейтинг</Text>
                        <Text fontSize="2xl" fontWeight="bold" color={overallRating >= 4 ? "green.500" : "orange.500"}>{overallRating || "—"}</Text>
                        <Text fontSize="xs" color="gray.500">по всем отзывам</Text>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={subtleBg}>
                        <Text fontSize="xs" color="gray.500">Баланс настроений</Text>
                        <HStack spacing={2} mt={1}>
                            <Badge colorScheme="green" variant="solid">{overallPositivity}% 👍</Badge>
                            <Badge colorScheme="red" variant="subtle">{overallNegativity}% 👎</Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" mt={1}>по всей стране</Text>
                    </Box>
                </SimpleGrid>

                {hotCities.length > 0 && (
                    <VStack align="stretch" spacing={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                            Города с максимальным ростом интереса
                        </Text>
                        <Wrap spacing={2}>
                            {hotCities.map(({ city, recent }) => (
                                <WrapItem key={city}>
                                    <Tag borderRadius="full" px={3} py={1} colorScheme="green">
                                        <HStack spacing={2}>
                                            <Icon as={FiTrendingUp} />
                                            <Text fontSize="sm">{city}</Text>
                                            <Badge variant="subtle">{recent} отзывов</Badge>
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
                            <Icon as={FiAward} color="green.500" />
                            <Text fontSize="sm" fontWeight="semibold">Лидеры по лояльности</Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                            {topPositiveCities.map(city => (
                                <HStack key={city.city} justify="space-between">
                                    <Text fontSize="xs" noOfLines={1}>{city.city}</Text>
                                    <Badge colorScheme="green" variant="subtle">{city.positivePercent}%</Badge>
                                </HStack>
                            ))}
                            {topPositiveCities.length === 0 && (
                                <Text fontSize="xs" color="gray.500">Недостаточно данных</Text>
                            )}
                        </VStack>
                    </Box>

                    <Box p={4} bg={negativeBg} borderRadius="lg">
                        <HStack mb={2} spacing={2}>
                            <Icon as={FiAlertTriangle} color="red.500" />
                            <Text fontSize="sm" fontWeight="semibold">Зоны риска</Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                            {topNegativeCities.map(city => (
                                <HStack key={city.city} justify="space-between">
                                    <Text fontSize="xs" noOfLines={1}>{city.city}</Text>
                                    <Badge colorScheme="red" variant="subtle">{city.negativePercent}%</Badge>
                                </HStack>
                            ))}
                            {topNegativeCities.length === 0 && (
                                <Text fontSize="xs" color="gray.500">Ярко выраженных проблем не найдено</Text>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>

                <Divider />

                <VStack align="stretch" spacing={4}>
                    {sortedCities.map(city => {
                        const trend = cityTrendMap[city.city];
                        const recent = trend?.recent ?? 0;

                        return (
                            <Box key={city.city} p={4} bg={subtleBg} borderRadius="lg">
                                <HStack justify="space-between" align="flex-start">
                                    <HStack spacing={3} align="flex-start">
                                        <Icon as={FiMapPin} color="brand.500" boxSize={5} mt={1} />
                                        <VStack align="flex-start" spacing={1}>
                                            <Text fontSize="sm" fontWeight="semibold">{city.city}</Text>
                                            <HStack spacing={2}>
                                                <Badge colorScheme="blue" variant="subtle"><Icon as={FiUsers} mr={1} />{city.count}</Badge>
                                                <Badge colorScheme={city.avgRating >= 3.5 ? "green" : "orange"} variant="solid">⭐ {city.avgRating || "—"}</Badge>
                                                <Badge colorScheme={city.positivePercent >= 60 ? "green" : "gray"} variant="subtle">{city.positivePercent}% 👍</Badge>
                                                {city.negativePercent >= 50 && (
                                                    <Badge colorScheme="red" variant="solid">Негатив {city.negativePercent}%</Badge>
                                                )}
                                            </HStack>
                                        </VStack>
                                    </HStack>

                                    <VStack align="flex-end" spacing={2}>
                                        {recent > 0 && (
                                            <Badge colorScheme="blue" variant="subtle">
                                                {recent} отзывов за 30 дней
                                            </Badge>
                                        )}
                                        <Button
                                            leftIcon={<FiFilter />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="brand"
                                            onClick={() => handleCityFilter([city.city])}
                                        >
                                            Фильтр по городу
                                        </Button>
                                    </VStack>
                                </HStack>

                                <Flex mt={3} h="10px" borderRadius="full" overflow="hidden" bg={neutralBg}>
                                    <Box flexBasis={`${city.positivePercent}%`} bg="green.400" />
                                    <Box flexBasis={`${city.neutralPercent}%`} bg="gray.300" />
                                    <Box flexBasis={`${city.negativePercent}%`} bg="red.400" />
                                </Flex>

                                <HStack mt={3} spacing={2}>
                                    <Badge colorScheme="green" variant="subtle">{city.positivePercent}% позитив</Badge>
                                    <Badge colorScheme="gray" variant="subtle">{city.neutralPercent}% нейтрально</Badge>
                                    <Badge colorScheme="red" variant="subtle">{city.negativePercent}% негатив</Badge>
                                </HStack>
                            </Box>
                        );
                    })}
                </VStack>

                {(bestCity && worstCity && bestCity.city !== worstCity.city) && (
                    <Box mt={2} p={4} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="lg" border="1px" borderColor={useColorModeValue("blue.200", "blue.700")}>
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue("blue.700", "blue.200")} mb={2}>
                            📍 Географические инсайты
                        </Text>
                        <Text fontSize="xs" color={useColorModeValue("blue.700", "blue.100")}>
                            Локация <strong>{bestCity.city}</strong> демонстрирует {bestCity.positivePercent}% позитивных отзывов и средний рейтинг {bestCity.avgRating}.<br />
                            <strong>{worstCity.city}</strong> отстаёт с {worstCity.positivePercent}% позитива и высоким уровнем негатива {worstCity.negativePercent}%.
                            Изучите лучшие практики лидеров и усилите поддержку в зонах риска.
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}