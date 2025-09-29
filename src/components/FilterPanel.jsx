import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    Wrap,
    WrapItem,
    Button,
    Input,
    FormLabel,
    Divider,
    useColorModeValue,
    Icon,
    ButtonGroup,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverCloseButton,
    InputGroup,
    InputLeftElement,
    CheckboxGroup,
    Checkbox,
    Stack,
    StackDivider,
    Tag,
    TagLabel,
    TagCloseButton,
    Spacer
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiFilter, FiSearch, FiStar, FiX } from "react-icons/fi";
import DateRangeSelector from "./DateRangeSelector";

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
    const hasUnspecified = useMemo(() => (
        data.some(item => !item.city || item.city.toString().trim() === "")
    ), [data]);

    const cityCountMap = useMemo(() => {
        return data.reduce((acc, item) => {
            const city = normalizeCity(item.city);
            if (!city || city === "Не указан") {
                return acc;
            }
            acc[city] = (acc[city] || 0) + 1;
            return acc;
        }, {});
    }, [data]);

    const cities = useMemo(() => {
        const list = Object.keys(cityCountMap).sort();
        if (hasUnspecified) {
            return [...list, "Не указан"];
        }
        return list;
    }, [cityCountMap, hasUnspecified]);

    // Добавляем "Не указан" в конец если есть такие данные
    const unspecifiedCount = useMemo(() => (
        data.filter(item => !item.city || item.city.toString().trim() === "").length
    ), [data]);

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
            dateFrom: '',
            dateTo: '',
            ratingRange: [1, 5],
            topics: [],
            sentiments: [],
            cities: [],
            searchText: ""
        });
    };

    // Функция для установки предустановленных периодов дат
    const handleTimePeriodSelect = (days) => {
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - days);

        onFiltersChange({
            ...filters,
            dateFrom: fromDate.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0]
        });
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case "положительно": return "green";
            case "нейтрально": return "gray";
            case "отрицательно": return "red";
            default: return "blue";
        }
    };

    const [localRating, setLocalRating] = useState(filters.ratingRange || [1, 5]);
    const [ratingDirty, setRatingDirty] = useState(false);
    const [citySearch, setCitySearch] = useState("");

    useEffect(() => {
        setLocalRating(filters.ratingRange || [1, 5]);
        setRatingDirty(false);
    }, [filters.ratingRange]);

    const filteredCities = useMemo(() => {
        if (!citySearch) {
            return cities;
        }
        return cities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));
    }, [cities, citySearch]);

    const ratingPresets = [
        { label: "Все", range: [1, 5] },
        { label: "5 ★", range: [5, 5] },
        { label: "4+ ★", range: [4, 5] },
        { label: "3-4 ★", range: [3, 4] },
        { label: "≤ 2 ★", range: [1, 2] }
    ];

    const isRatingPresetActive = (range) => (
        filters.ratingRange?.[0] === range[0] && filters.ratingRange?.[1] === range[1]
    );

    const handleRatingInputChange = (index) => (valueString) => {
        const value = Math.min(5, Math.max(1, parseInt(valueString, 10) || 1));
        setLocalRating(prev => {
            const next = [...prev];
            next[index] = value;
            if (next[0] > next[1]) {
                if (index === 0) {
                    next[1] = value;
                } else {
                    next[0] = value;
                }
            }
            return next;
        });
        setRatingDirty(true);
    };

    const applyRatingRange = (range) => {
        const nextRange = range || localRating;
        setLocalRating(nextRange);
        setRatingDirty(false);
        onFiltersChange({
            ...filters,
            ratingRange: nextRange
        });
    };

    const handleCitySelectionChange = (values) => {
        onFiltersChange({
            ...filters,
            cities: values
        });
    };

    const resetCityFilter = () => {
        setCitySearch("");
        onFiltersChange({
            ...filters,
            cities: []
        });
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

                {/* Выбор диапазона дат */}
                <DateRangeSelector
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    data={data}
                />

                {/* Диапазон рейтингов */}
                <Box>
                    <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
                        Рейтинг отзывов
                    </FormLabel>
                    <VStack align="stretch" spacing={3}>
                        <ButtonGroup size="xs" variant="outline" isAttached>
                            {ratingPresets.map(({ label, range }) => (
                                <Button
                                    key={label}
                                    leftIcon={<Icon as={FiStar} />}
                                    onClick={() => applyRatingRange(range)}
                                    colorScheme={isRatingPresetActive(range) ? "yellow" : "gray"}
                                    variant={isRatingPresetActive(range) ? "solid" : "outline"}
                                >
                                    {label}
                                </Button>
                            ))}
                        </ButtonGroup>

                        <HStack spacing={3} align="center">
                            <NumberInput
                                value={localRating[0]}
                                min={1}
                                max={5}
                                step={1}
                                size="sm"
                                onChange={handleRatingInputChange(0)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.500">до</Text>
                            <NumberInput
                                value={localRating[1]}
                                min={1}
                                max={5}
                                step={1}
                                size="sm"
                                onChange={handleRatingInputChange(1)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Button
                                size="sm"
                                colorScheme="yellow"
                                onClick={() => applyRatingRange()}
                                isDisabled={!ratingDirty}
                            >
                                Применить
                            </Button>
                        </HStack>
                    </VStack>
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
                        Города ({cities.length} доступно)
                    </FormLabel>
                    <Popover placement="bottom-start" closeOnBlur={false}>
                        {({ onClose }) => (
                            <>
                                <PopoverTrigger>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        rightIcon={<Icon as={FiFilter} />}
                                    >
                                        {filters.cities.length === 0
                                            ? "Все города"
                                            : `${filters.cities.length} выбрано`}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent width="320px">
                                    <PopoverHeader fontWeight="semibold">
                                        Выберите города
                                    </PopoverHeader>
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                        <VStack align="stretch" spacing={3} divider={<StackDivider />}> 
                                            <InputGroup size="sm">
                                                <InputLeftElement pointerEvents="none" color="gray.400">
                                                    <Icon as={FiSearch} />
                                                </InputLeftElement>
                                                <Input
                                                    placeholder="Поиск города..."
                                                    value={citySearch}
                                                    onChange={(e) => setCitySearch(e.target.value)}
                                                />
                                            </InputGroup>

                                            <CheckboxGroup value={filters.cities} onChange={handleCitySelectionChange}>
                                                <Stack spacing={2} maxH="240px" overflowY="auto">
                                                    {filteredCities.length === 0 && (
                                                        <Text fontSize="sm" color="gray.500">
                                                            Ничего не найдено
                                                        </Text>
                                                    )}
                                                    {filteredCities.map((city) => {
                                                        const count = city === "Не указан" ? unspecifiedCount : cityCountMap[city] || 0;
                                                        return (
                                                            <Checkbox key={city} value={city} alignItems="flex-start">
                                                                <HStack justify="space-between" w="full" align="flex-start">
                                                                    <VStack spacing={0} align="flex-start">
                                                                        <Text fontSize="sm">{city}</Text>
                                                                        <Text fontSize="xs" color="gray.500">{count} отзывов</Text>
                                                                    </VStack>
                                                                    <Badge colorScheme="blue" variant="subtle">{count}</Badge>
                                                                </HStack>
                                                            </Checkbox>
                                                        );
                                                    })}
                                                </Stack>
                                            </CheckboxGroup>

                                            <HStack>
                                                <Button size="xs" variant="ghost" onClick={resetCityFilter}>
                                                    Сбросить
                                                </Button>
                                                <Spacer />
                                                <Text fontSize="xs" color="gray.500">
                                                    Выбрано: {filters.cities.length}
                                                </Text>
                                                <Button size="xs" colorScheme="brand" variant="solid" onClick={onClose}>
                                                    Готово
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </PopoverBody>
                                </PopoverContent>
                            </>
                        )}
                    </Popover>

                    {filters.cities.length > 0 && (
                        <Wrap spacing={2} mt={3}>
                            {filters.cities.map(city => (
                                <WrapItem key={city}>
                                    <Tag size="sm" borderRadius="full" colorScheme="brand">
                                        <TagLabel>{city}</TagLabel>
                                        <TagCloseButton onClick={() => handleCitySelectionChange(filters.cities.filter(item => item !== city))} />
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    )}
                </Box>
            </VStack>
        </Box>
    );
}