import {
    Box,
    HStack,
    VStack,
    Select,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    Text,
    Badge,
    Wrap,
    WrapItem,
    Button,
    Input,
    FormLabel,
    Divider,
    useColorModeValue,
    Icon
} from "@chakra-ui/react";
import { useState } from "react";
import { FiFilter, FiX } from "react-icons/fi";

export default function FilterPanel({ filters, onFiltersChange, data = [] }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const topics = [
        "Отделения", "Карты", "Депозиты и вклады", "Переводы и платежи",
        "Мобильное приложение", "Служба поддержки", "Премиум-обслуживание",
        "Кэшбек и бонусы", "Ипотека"
    ];

    const sentiments = ["положительно", "нейтрально", "отрицательно"];

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
            'москва': 'Москва',
            'мск': 'Москва',
            'на волге': 'Поволжье',
            'волга': 'Поволжье',
            'россия': 'Россия (общее)',
            'рф': 'Россия (общее)',
            'вернуласьчитаю': 'Не указан', // из данных
        };

        const lower = normalized.toLowerCase();
        return cityMappings[lower] || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    };

    // Динамически получаем уникальные города из данных
    const cities = [...new Set(
        data
            .map(item => normalizeCity(item.city))
            .filter(city => city && city !== "Не указан")
            .sort()
    )];

    // Добавляем "Не указан" в конец если есть такие данные
    const hasUnspecified = data.some(item => !item.city || item.city.toString().trim() === "");
    if (hasUnspecified) {
        cities.push("Не указан");
    }

    // Функция для фильтрации стоп-слов
    const filterStopWords = (text) => {
        if (!text) return '';
        const stopWords = [
            'и', 'в', 'на', 'с', 'по', 'для', 'от', 'к', 'о', 'об', 'за', 'до', 'из', 'у', 'во', 'со',
            'а', 'но', 'да', 'или', 'если', 'то', 'что', 'как', 'где', 'куда', 'когда', 'почему',
            'через', 'при', 'под', 'над', 'без', 'между', 'среди', 'около', 'вокруг', 'против',
            'это', 'тот', 'та', 'те', 'этот', 'эта', 'эти', 'все', 'всё', 'каждый', 'любой',
            'мне', 'меня', 'мой', 'моя', 'моё', 'мои', 'ты', 'тебя', 'твой', 'твоя', 'твоё', 'твои',
            'он', 'она', 'оно', 'они', 'его', 'её', 'их', 'ему', 'ей', 'им', 'них', 'нём', 'ней',
            'быть', 'есть', 'был', 'была', 'было', 'были', 'будет', 'будут', 'буду', 'будешь',
            'не', 'ни', 'нет', 'никак', 'никто', 'ничто', 'нигде', 'никуда', 'никогда',
            'очень', 'более', 'менее', 'самый', 'тоже', 'также', 'ещё', 'уже', 'только', 'лишь'
        ];
        
        return text
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .join(' ');
    };

    // Предустановленные временные периоды
    const timePeriods = [
        { label: "Последний месяц", days: 30 },
        { label: "Последние 3 месяца", days: 90 },
        { label: "Последние 6 месяцев", days: 180 },
        { label: "Последний год", days: 365 },
        { label: "Последние 2 года", days: 730 },
        { label: "Все время", days: 3650 }
    ];

    const handleTopicToggle = (topic) => {
        const newTopics = filters.topics.includes(topic)
            ? filters.topics.filter(t => t !== topic)
            : [...filters.topics, topic];
        onFiltersChange({ ...filters, topics: newTopics });
    };

    const handleSentimentToggle = (sentiment) => {
        const newSentiments = filters.sentiments.includes(sentiment)
            ? filters.sentiments.filter(s => s !== sentiment)
            : [...filters.sentiments, sentiment];
        onFiltersChange({ ...filters, sentiments: newSentiments });
    };

    const clearAllFilters = () => {
        onFiltersChange({
            dateRange: [0, 365],
            ratingRange: [1, 5],
            topics: [],
            sentiments: [],
            cities: [],
            searchText: ""
        });
    };

    const handleTimePeriodSelect = (days) => {
        onFiltersChange({ ...filters, dateRange: [0, days] });
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case "положительно": return "green";
            case "нейтрально": return "gray";
            case "отрицательно": return "red";
            default: return "blue";
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
            <HStack justify="space-between" mb={4}>
                <HStack>
                    <Icon as={FiFilter} color="brand.500" />
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                        Фильтры аналитики
                    </Text>
                </HStack>
                <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                    <Icon as={FiX} mr={1} />
                    Очистить все
                </Button>
            </HStack>

            <VStack spacing={6} align="stretch">
                {/* Поиск по тексту */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>
                        Поиск в отзывах
                    </FormLabel>
                    <Input
                        placeholder="Найти в тексте отзывов..."
                        value={filters.searchText}
                        onChange={(e) => onFiltersChange({ ...filters, searchText: e.target.value })}
                        size="sm"
                    />
                </Box>

                <Divider />

                {/* Диапазон дат */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
                        Временной период: {filters.dateRange[1] === 3650 ? "Все время" : `Последние ${filters.dateRange[1]} дней`}
                    </FormLabel>
                    
                    {/* Быстрый выбор периода */}
                    <Wrap spacing={2} mb={4}>
                        {timePeriods.map((period) => (
                            <WrapItem key={period.days}>
                                <Button
                                    size="xs"
                                    variant={filters.dateRange[1] === period.days ? "solid" : "outline"}
                                    colorScheme="brand"
                                    onClick={() => handleTimePeriodSelect(period.days)}
                                >
                                    {period.label}
                                </Button>
                            </WrapItem>
                        ))}
                    </Wrap>

                    {/* Ручная настройка диапазона */}
                    <Text fontSize="xs" color="gray.500" mb={2}>
                        Точная настройка (дни): {filters.dateRange[0]} - {filters.dateRange[1]}
                    </Text>
                    <RangeSlider
                        value={filters.dateRange}
                        onChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
                        min={0}
                        max={3650}
                        step={7}
                    >
                        <RangeSliderTrack>
                            <RangeSliderFilledTrack bg="brand.500" />
                        </RangeSliderTrack>
                        <RangeSliderThumb index={0} />
                        <RangeSliderThumb index={1} />
                    </RangeSlider>
                </Box>

                {/* Диапазон рейтингов */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
                        Рейтинг: {filters.ratingRange[0]} - {filters.ratingRange[1]} звезд
                    </FormLabel>
                    <RangeSlider
                        value={filters.ratingRange}
                        onChange={(value) => onFiltersChange({ ...filters, ratingRange: value })}
                        min={1}
                        max={5}
                        step={1}
                    >
                        <RangeSliderTrack>
                            <RangeSliderFilledTrack bg="yellow.400" />
                        </RangeSliderTrack>
                        <RangeSliderThumb index={0} />
                        <RangeSliderThumb index={1} />
                    </RangeSlider>
                </Box>

                <Divider />

                {/* Темы */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
                        Темы отзывов ({filters.topics.length} выбрано)
                    </FormLabel>
                    <Wrap spacing={2}>
                        {topics.map((topic) => (
                            <WrapItem key={topic}>
                                <Badge
                                    colorScheme={filters.topics.includes(topic) ? "brand" : "gray"}
                                    cursor="pointer"
                                    onClick={() => handleTopicToggle(topic)}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    variant={filters.topics.includes(topic) ? "solid" : "outline"}
                                    _hover={{ transform: "scale(1.05)" }}
                                    transition="all 0.2s"
                                >
                                    {topic}
                                </Badge>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>

                {/* Настроения */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
                        Эмоциональная окраска ({filters.sentiments.length} выбрано)
                    </FormLabel>
                    <Wrap spacing={2}>
                        {sentiments.map((sentiment) => (
                            <WrapItem key={sentiment}>
                                <Badge
                                    colorScheme={filters.sentiments.includes(sentiment)
                                        ? getSentimentColor(sentiment)
                                        : "gray"
                                    }
                                    cursor="pointer"
                                    onClick={() => handleSentimentToggle(sentiment)}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    variant={filters.sentiments.includes(sentiment) ? "solid" : "outline"}
                                    _hover={{ transform: "scale(1.05)" }}
                                    transition="all 0.2s"
                                >
                                    {sentiment}
                                </Badge>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>

                {/* Города */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={2}>
                        Город ({cities.length} доступно)
                    </FormLabel>
                    <Select
                        placeholder="Все города"
                        value={filters.cities[0] || ""}
                        onChange={(e) => onFiltersChange({
                            ...filters,
                            cities: e.target.value ? [e.target.value] : []
                        })}
                        size="sm"
                    >
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city} ({data.filter(item => normalizeCity(item.city) === city).length})
                            </option>
                        ))}
                    </Select>
                </Box>
            </VStack>
        </Box>
    );
}