import React from 'react';
import {
    Box,
    SimpleGrid,
    Skeleton,
    SkeletonText,
    HStack,
    VStack
} from '@chakra-ui/react';

export const ReviewCardSkeleton = () => (
    <Box
        bg="white"
        p={6}
        rounded="xl"
        boxShadow="sm"
        border="1px"
        borderColor="gray.100"
    >
        <VStack align="stretch" spacing={4}>
            {/* Header with rating and date */}
            <HStack justify="space-between">
                <Skeleton height="20px" width="60px" />
                <Skeleton height="20px" width="100px" />
            </HStack>

            {/* Title */}
            <Skeleton height="24px" width="80%" />

            {/* Text content */}
            <SkeletonText noOfLines={4} spacing={2} />

            {/* Topics and sentiments */}
            <HStack spacing={2} wrap="wrap">
                <Skeleton height="24px" width="80px" rounded="full" />
                <Skeleton height="24px" width="60px" rounded="full" />
                <Skeleton height="24px" width="100px" rounded="full" />
            </HStack>

            {/* Footer */}
            <HStack justify="space-between">
                <Skeleton height="20px" width="120px" />
                <Skeleton height="20px" width="80px" />
            </HStack>
        </VStack>
    </Box>
);

export const ReviewGridSkeleton = ({ count = 6 }) => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {Array.from({ length: count }).map((_, index) => (
            <ReviewCardSkeleton key={index} />
        ))}
    </SimpleGrid>
);

export const ReviewListSkeleton = ({ count = 5 }) => (
    <VStack spacing={4} align="stretch">
        {Array.from({ length: count }).map((_, index) => (
            <Box
                key={index}
                bg="white"
                p={6}
                rounded="xl"
                boxShadow="sm"
                border="1px"
                borderColor="gray.100"
            >
                <HStack align="start" spacing={4}>
                    <VStack align="stretch" spacing={3} flex={1}>
                        {/* Header */}
                        <HStack justify="space-between">
                            <Skeleton height="20px" width="120px" />
                            <Skeleton height="20px" width="80px" />
                        </HStack>

                        {/* Title */}
                        <Skeleton height="24px" width="70%" />

                        {/* Content */}
                        <SkeletonText noOfLines={2} spacing={2} />

                        {/* Tags */}
                        <HStack spacing={2}>
                            <Skeleton height="20px" width="60px" rounded="full" />
                            <Skeleton height="20px" width="80px" rounded="full" />
                        </HStack>
                    </VStack>
                </HStack>
            </Box>
        ))}
    </VStack>
);

export const AnalyticsSkeleton = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {Array.from({ length: 8 }).map((_, index) => (
            <Box
                key={index}
                bg="white"
                p={6}
                rounded="xl"
                boxShadow="sm"
                border="1px"
                borderColor="gray.100"
            >
                <VStack align="stretch" spacing={4}>
                    <Skeleton height="200px" />
                    <Skeleton height="24px" width="60%" />
                    <SkeletonText noOfLines={2} />
                </VStack>
            </Box>
        ))}
    </SimpleGrid>
);

export default {
    ReviewCardSkeleton,
    ReviewGridSkeleton,
    ReviewListSkeleton,
    AnalyticsSkeleton
};