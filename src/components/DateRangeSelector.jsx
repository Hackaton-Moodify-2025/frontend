import {
    Box,
    HStack,
    VStack,
    Input,
    FormLabel,
    Button,
    Text,
    useColorModeValue,
    Icon,
    Tooltip
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiCalendar, FiX } from "react-icons/fi";

export default function DateRangeSelector({ filters, onFiltersChange, data = [] }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '');
    const [dateTo, setDateTo] = useState(filters.dateTo || '');

    // Получаем минимальную и максимальную даты из данных
    const getDateRange = () => {
        if (!data || data.length === 0) return { min: '', max: '' };

        const dates = data
            .map(item => item.date)
            .filter(date => date)
            .sort();

        return {
            min: dates[0] || '',
            max: dates[dates.length - 1] || ''
        };
    };

    const { min: minDate, max: maxDate } = getDateRange();

    // Предустановленные периоды
    const presets = [
        {
            label: "Последний месяц",
            getValue: () => {
                const to = new Date();
                const from = new Date();
                from.setMonth(from.getMonth() - 1);
                return {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0]
                };
            }
        },
        {
            label: "Последние 3 месяца",
            getValue: () => {
                const to = new Date();
                const from = new Date();
                from.setMonth(from.getMonth() - 3);
                return {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0]
                };
            }
        },
        {
            label: "Последние 6 месяцев",
            getValue: () => {
                const to = new Date();
                const from = new Date();
                from.setMonth(from.getMonth() - 6);
                return {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0]
                };
            }
        },
        {
            label: "Последний год",
            getValue: () => {
                const to = new Date();
                const from = new Date();
                from.setFullYear(from.getFullYear() - 1);
                return {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0]
                };
            }
        }
    ];

    // Обработчики изменения дат
    const handleDateFromChange = (value) => {
        setDateFrom(value);
        onFiltersChange({
            ...filters,
            dateFrom: value,
            dateTo: dateTo
        });
    };

    const handleDateToChange = (value) => {
        setDateTo(value);
        onFiltersChange({
            ...filters,
            dateFrom: dateFrom,
            dateTo: value
        });
    };

    // Применение пресета
    const applyPreset = (preset) => {
        const { from, to } = preset.getValue();
        setDateFrom(from);
        setDateTo(to);
        onFiltersChange({
            ...filters,
            dateFrom: from,
            dateTo: to
        });
    };

    // Очистка фильтра
    const clearDateFilter = () => {
        setDateFrom('');
        setDateTo('');
        onFiltersChange({
            ...filters,
            dateFrom: '',
            dateTo: ''
        });
    };

    // Синхронизация с внешними изменениями фильтров
    useEffect(() => {
        setDateFrom(filters.dateFrom || '');
        setDateTo(filters.dateTo || '');
    }, [filters.dateFrom, filters.dateTo]);

    return (
        <Box
            bg={bgColor}
            p={4}
            borderRadius="md"
            border="1px"
            borderColor={borderColor}
        >
            <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                    <HStack>
                        <Icon as={FiCalendar} color="blue.500" />
                        <Text fontWeight="semibold">Период дат</Text>
                    </HStack>
                    {(dateFrom || dateTo) && (
                        <Tooltip label="Очистить фильтр дат">
                            <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={clearDateFilter}
                            >
                                <Icon as={FiX} />
                            </Button>
                        </Tooltip>
                    )}
                </HStack>

                <HStack spacing={4}>
                    <VStack spacing={2} flex={1}>
                        <FormLabel fontSize="sm" mb={0}>Дата от</FormLabel>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            size="sm"
                        />
                    </VStack>

                    <VStack spacing={2} flex={1}>
                        <FormLabel fontSize="sm" mb={0}>Дата до</FormLabel>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => handleDateToChange(e.target.value)}
                            size="sm"
                        />
                    </VStack>
                </HStack>

                {minDate && maxDate && (
                    <Text fontSize="xs" color="gray.500">
                        Доступный период: {minDate} — {maxDate}
                    </Text>
                )}

                <VStack spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">Быстрый выбор:</Text>
                    <HStack spacing={2} wrap="wrap">
                        {presets.map((preset, index) => (
                            <Button
                                key={index}
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => applyPreset(preset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </HStack>
                </VStack>
            </VStack>
        </Box>
    );
}