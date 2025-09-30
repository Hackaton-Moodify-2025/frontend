import React from 'react';
import {
    Box,
    SimpleGrid,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    HStack,
    VStack,
    useColorModeValue
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

export const AnalyticsSkeleton = () => {
    const cardBg = useColorModeValue("white", "gray.900");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    const subtleSurface = useColorModeValue("gray.50", "whiteAlpha.100");

    const SectionCard = ({ children, ...rest }) => (
        <Box
            bg={cardBg}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            p={{ base: 5, md: 6, xl: 7 }}
            {...rest}
        >
            {children}
        </Box>
    );

    const SubCard = ({ children, ...rest }) => (
        <Box
            bg={subtleSurface}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            p={{ base: 4, md: 5 }}
            {...rest}
        >
            {children}
        </Box>
    );

    const ListItemSkeleton = () => (
        <HStack align="flex-start" spacing={4} w="full">
            <SkeletonCircle size="10" />
            <VStack spacing={2} align="flex-start" flex={1}>
                <Skeleton height="18px" width="45%" />
                <Skeleton height="16px" width="35%" />
                <SkeletonText noOfLines={2} spacing={2} width="100%" />
            </VStack>
            <Skeleton height="24px" width="64px" borderRadius="md" />
        </HStack>
    );

    return (
        <VStack spacing={{ base: 8, md: 10 }} align="stretch">
            <SectionCard>
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                    <HStack spacing={3} flexWrap="wrap">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Skeleton key={idx} height="20px" width="110px" borderRadius="full" />
                        ))}
                    </HStack>
                    <VStack align="flex-start" spacing={3}>
                        <Skeleton height="32px" width={{ base: "80%", md: "45%" }} />
                        <SkeletonText noOfLines={2} spacing={3} width={{ base: "100%", md: "70%" }} />
                    </VStack>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <SubCard key={idx}>
                                <VStack align="flex-start" spacing={4}>
                                    <SkeletonCircle size="10" />
                                    <Skeleton height="24px" width="70%" />
                                    <SkeletonText noOfLines={3} spacing={2} width="100%" />
                                </VStack>
                            </SubCard>
                        ))}
                    </SimpleGrid>
                </VStack>
            </SectionCard>

            <SectionCard>
                <VStack align="stretch" spacing={5}>
                    <Skeleton height="24px" width="35%" />
                    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4}>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <SubCard key={idx}>
                                <VStack align="flex-start" spacing={4}>
                                    <Skeleton height="18px" width="50%" />
                                    <Skeleton height="30px" width="60%" />
                                    <SkeletonText noOfLines={2} spacing={2} width="100%" />
                                </VStack>
                            </SubCard>
                        ))}
                    </SimpleGrid>
                </VStack>
            </SectionCard>

            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 6, xl: 8 }}>
                {Array.from({ length: 2 }).map((_, idx) => (
                    <SectionCard key={idx}>
                        <VStack align="stretch" spacing={5}>
                            <Skeleton height="24px" width="40%" />
                            {Array.from({ length: 3 }).map((__, innerIdx) => (
                                <ListItemSkeleton key={innerIdx} />
                            ))}
                        </VStack>
                    </SectionCard>
                ))}
            </SimpleGrid>

            <SectionCard>
                <VStack align="stretch" spacing={5}>
                    <Skeleton height="24px" width="30%" />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <SubCard key={idx}>
                                <VStack align="flex-start" spacing={3}>
                                    <Skeleton height="18px" width="60%" />
                                    <Skeleton height="24px" width="50%" />
                                    <SkeletonText noOfLines={2} spacing={2} width="100%" />
                                </VStack>
                            </SubCard>
                        ))}
                    </SimpleGrid>
                </VStack>
            </SectionCard>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
                <SectionCard>
                    <VStack align="stretch" spacing={5}>
                        <Skeleton height="24px" width="50%" />
                        <Skeleton height="240px" borderRadius="xl" />
                    </VStack>
                </SectionCard>
                <SectionCard>
                    <VStack align="stretch" spacing={5}>
                        <Skeleton height="24px" width="40%" />
                        <Skeleton height="240px" borderRadius="xl" />
                    </VStack>
                </SectionCard>
            </SimpleGrid>

            <SectionCard>
                <VStack align="stretch" spacing={5}>
                    <Skeleton height="24px" width="35%" />
                    <VStack spacing={4} align="stretch">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <HStack key={idx} spacing={4} align="center">
                                <Skeleton height="18px" width="40px" borderRadius="md" />
                                <Skeleton height="18px" flex={1} borderRadius="md" />
                                <Skeleton height="18px" width="15%" borderRadius="md" />
                                <Skeleton height="18px" width="12%" borderRadius="md" />
                            </HStack>
                        ))}
                    </VStack>
                </VStack>
            </SectionCard>

            <SectionCard>
                <VStack align="stretch" spacing={4}>
                    <Skeleton height="24px" width="28%" />
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <SubCard key={idx}>
                            <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                    <Skeleton height="18px" width="45%" />
                                    <Skeleton height="18px" width="20%" />
                                </HStack>
                                <SkeletonText noOfLines={2} spacing={2} width="100%" />
                            </VStack>
                        </SubCard>
                    ))}
                </VStack>
            </SectionCard>
        </VStack>
    );
};

export default {
    ReviewCardSkeleton,
    ReviewGridSkeleton,
    ReviewListSkeleton,
    AnalyticsSkeleton
};