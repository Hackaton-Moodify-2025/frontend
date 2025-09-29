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
    Tooltip,
    ButtonGroup,
    Spacer,
    useToast
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiCheck, FiX } from "react-icons/fi";

export default function DateRangeSelector({ filters, onFiltersChange, data = [] }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const [localDateFrom, setLocalDateFrom] = useState(filters.dateFrom || "");
    const [localDateTo, setLocalDateTo] = useState(filters.dateTo || "");
    const [isDirty, setIsDirty] = useState(false);
    const toast = useToast();

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
    const hasInvalidRange = useMemo(() => {
        if (!localDateFrom || !localDateTo) return false;
        return new Date(localDateFrom) > new Date(localDateTo);
    }, [localDateFrom, localDateTo]);

    const handleDateFromChange = (value) => {
        setLocalDateFrom(value);
        setIsDirty(true);
    };

    const handleDateToChange = (value) => {
        setLocalDateTo(value);
        setIsDirty(true);
    };

    const applyDateRange = () => {
        if (hasInvalidRange) {
            toast({
                title: "Проверьте даты",
                description: "Дата начала не может быть позже даты окончания",
                status: "warning",
                duration: 3000,
                isClosable: true
            });
            return;
        }

        onFiltersChange({
            ...filters,
            dateFrom: localDateFrom,
            dateTo: localDateTo
        });
        setIsDirty(false);
    };

    // Применение пресета
    const applyPreset = (preset) => {
        const { from, to } = preset.getValue();
        setLocalDateFrom(from);
        setLocalDateTo(to);
        onFiltersChange({
            ...filters,
            dateFrom: from,
            dateTo: to
        });
        setIsDirty(false);
    };

    // Очистка фильтра
    const clearDateFilter = () => {
        setLocalDateFrom('');
        setLocalDateTo('');
        onFiltersChange({
            ...filters,
            dateFrom: '',
            dateTo: ''
        });
        setIsDirty(false);
    };

    // Синхронизация с внешними изменениями фильтров
    useEffect(() => {
        setLocalDateFrom(filters.dateFrom || '');
        setLocalDateTo(filters.dateTo || '');
        setIsDirty(false);
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
                    {(filters.dateFrom || filters.dateTo) && (
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
                            value={localDateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            size="sm"
                        />
                    </VStack>

                    <VStack spacing={2} flex={1}>
                        <FormLabel fontSize="sm" mb={0}>Дата до</FormLabel>
                        <Input
                            type="date"
                            value={localDateTo}
                            onChange={(e) => handleDateToChange(e.target.value)}
                            size="sm"
                        />
                    </VStack>
                </HStack>

                {hasInvalidRange && (
                    <Text fontSize="xs" color="red.400">
                        Дата начала должна быть не позже даты окончания
                    </Text>
                )}

                {minDate && maxDate && (
                    <Text fontSize="xs" color="gray.500">
                        Доступный период: {minDate} — {maxDate}
                    </Text>
                )}

                <VStack spacing={3} align="stretch">
                    <HStack>
                        <Text fontSize="sm" fontWeight="medium">Быстрый выбор:</Text>
                        <Spacer />
                        <ButtonGroup size="xs" variant="outline" colorScheme="blue">
                            {presets.map((preset, index) => (
                                <Button
                                    key={index}
                                    onClick={() => applyPreset(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </HStack>

                    <HStack justify="flex-end" spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="gray" onClick={clearDateFilter}>
                            Сбросить
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="brand"
                            leftIcon={<FiCheck />}
                            onClick={applyDateRange}
                            isDisabled={!isDirty || hasInvalidRange}
                        >
                            Применить
                        </Button>
                    </HStack>
                </VStack>
            </VStack>
        </Box>
    );
}