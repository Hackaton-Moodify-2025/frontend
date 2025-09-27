import React from 'react';
import {
    Box,
    Button,
    HStack,
    Text,
    Select,
    Flex,
    IconButton,
    Spacer
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const Pagination = ({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onLimitChange,
    loading = false
}) => {
    if (total === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Text color="gray.500">Нет данных для отображения</Text>
            </Box>
        );
    }

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const generatePageButtons = () => {
        const buttons = [];
        const maxButtons = 5;

        let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        // First page button
        if (startPage > 1) {
            buttons.push(
                <Button
                    key={1}
                    size="sm"
                    variant={page === 1 ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => onPageChange(1)}
                    isDisabled={loading}
                >
                    1
                </Button>
            );

            if (startPage > 2) {
                buttons.push(
                    <Text key="ellipsis1" color="gray.500">
                        ...
                    </Text>
                );
            }
        }

        // Page buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="sm"
                    variant={page === i ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => onPageChange(i)}
                    isDisabled={loading}
                >
                    {i}
                </Button>
            );
        }

        // Last page button
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <Text key="ellipsis2" color="gray.500">
                        ...
                    </Text>
                );
            }

            buttons.push(
                <Button
                    key={totalPages}
                    size="sm"
                    variant={page === totalPages ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => onPageChange(totalPages)}
                    isDisabled={loading}
                >
                    {totalPages}
                </Button>
            );
        }

        return buttons;
    };

    return (
        <Box
            bg="white"
            p={4}
            rounded="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.100"
        >
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                gap={4}
            >
                {/* Items info */}
                <Text fontSize="sm" color="gray.600">
                    Показано {startItem}-{endItem} из {total} отзывов
                </Text>

                <Spacer />

                {/* Page navigation */}
                <HStack spacing={2}>
                    <IconButton
                        size="sm"
                        icon={<ChevronLeftIcon />}
                        onClick={() => onPageChange(page - 1)}
                        isDisabled={page <= 1 || loading}
                        aria-label="Предыдущая страница"
                    />

                    {generatePageButtons()}

                    <IconButton
                        size="sm"
                        icon={<ChevronRightIcon />}
                        onClick={() => onPageChange(page + 1)}
                        isDisabled={page >= totalPages || loading}
                        aria-label="Следующая страница"
                    />
                </HStack>

                <Spacer />

                {/* Items per page selector */}
                <Flex align="center" gap={2}>
                    <Text fontSize="sm" color="gray.600">
                        Показать:
                    </Text>
                    <Select
                        size="sm"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        w="auto"
                        isDisabled={loading}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </Select>
                </Flex>
            </Flex>
        </Box>
    );
};

export default Pagination;