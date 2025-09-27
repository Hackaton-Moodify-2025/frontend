import { useState, useEffect } from "react";
import {
  Box, SimpleGrid, Select, HStack, Text, Link, Badge, VStack, IconButton, Image, Flex, Alert, AlertIcon, Button
} from "@chakra-ui/react";
import { FaTh, FaList, FaSync } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useReviews } from "../hooks/useAPI";
import { ReviewGridSkeleton, ReviewListSkeleton } from "../components/LoadingSkeleton";
import Pagination from "../components/Pagination";

function getHost(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState("grid");

  const {
    reviews,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changeLimit,
    refresh
  } = useReviews({ limit: 20 });

  // Get unique topics and sentiments for filters
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableSentiments, setAvailableSentiments] = useState([]);

  useEffect(() => {
    if (reviews.length > 0) {
      const topics = new Set();
      const sentiments = new Set();

      reviews.forEach(review => {
        if (review.topics) {
          review.topics.forEach(topic => topics.add(topic));
        }
        if (review.sentiments) {
          review.sentiments.forEach(sentiment => sentiments.add(sentiment));
        }
      });

      setAvailableTopics([...topics].sort());
      setAvailableSentiments([...sentiments].sort());
    }
  }, [reviews]);

  return (
    <Box py={6}>
      <Box
        bg="white"
        p={4}
        rounded="xl"
        boxShadow="sm"
        mb={6}
        border="1px"
        borderColor="gray.100"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
        >
          <HStack spacing={4} flex={1}>
            <Select
              placeholder="Фильтр по теме"
              minW={{ base: "auto", md: "200px" }}
              w={{ base: "full", md: "auto" }}
              value={filters.topic}
              onChange={(e) => updateFilters({ topic: e.target.value })}
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
              isDisabled={loading}
            >
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </Select>

            <Select
              placeholder="Фильтр по тональности"
              minW={{ base: "auto", md: "220px" }}
              w={{ base: "full", md: "auto" }}
              value={filters.sentiment}
              onChange={(e) => updateFilters({ sentiment: e.target.value })}
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
              isDisabled={loading}
            >
              {availableSentiments.map((sentiment) => (
                <option key={sentiment} value={sentiment}>{sentiment}</option>
              ))}
            </Select>

            <Button
              leftIcon={<FaSync />}
              onClick={refresh}
              isLoading={loading}
              loadingText="Обновление..."
              size="sm"
              variant="outline"
              colorScheme="brand"
            >
              Обновить
            </Button>
          </HStack>

          <HStack spacing={2}>
            <IconButton
              icon={<FaTh />}
              onClick={() => setViewMode("grid")}
              aria-label="Grid"
              colorScheme={viewMode === "grid" ? "brand" : "gray"}
              variant={viewMode === "grid" ? "solid" : "ghost"}
              isDisabled={loading}
            />
            <IconButton
              icon={<FaList />}
              onClick={() => setViewMode("list")}
              aria-label="List"
              colorScheme={viewMode === "list" ? "brand" : "gray"}
              variant={viewMode === "list" ? "solid" : "ghost"}
              isDisabled={loading}
            />
          </HStack>
        </Flex>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6} rounded="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Ошибка загрузки данных</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
          <Button ml="auto" size="sm" onClick={refresh}>
            Повторить
          </Button>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <>
          {viewMode === "grid" ? (
            <ReviewGridSkeleton count={pagination.limit} />
          ) : (
            <ReviewListSkeleton count={pagination.limit} />
          )}
        </>
      )}

      {/* Reviews Content */}
      {!loading && !error && (
        <SimpleGrid
          columns={viewMode === "grid" ? { base: 1, md: 2, lg: 3, xl: 4 } : 1}
          spacing={6}
        >
          {reviews.map((review) => {
            const host = getHost(review.link);
            return (
              <Box
                key={review.id}
                bg="white"
                p={5}
                rounded="xl"
                boxShadow="md"
                border="1px"
                borderColor="gray.100"
                transition="all 0.2s"
                _hover={{
                  boxShadow: "lg",
                  transform: "translateY(-2px)",
                  borderColor: "brand.200"
                }}
              >
                <Flex align="center" mb={2}>
                  {host && (
                    <Image
                      src={`/logos/${host.split(".")[0]}.png`}
                      alt={host}
                      boxSize="20px"
                      mr={2}
                      fallback={<Box boxSize="20px" bg="gray.200" rounded="sm" mr={2} />}
                    />
                  )}
                  <Link
                    as={RouterLink}
                    to={`/review/${review.id}`}
                    fontWeight="bold"
                    color="brand.500"
                    noOfLines={1}
                    flex={1}
                  >
                    {review.title}
                  </Link>
                </Flex>

                <Text fontSize="sm" color="gray.600" mb={2}>
                  {review.date} · {review.city} · ⭐ {review.rating}
                </Text>

                <Text
                  noOfLines={viewMode === "grid" ? 3 : 6}
                  fontSize="sm"
                  color="gray.800"
                  mb={3}
                >
                  {review.text}
                </Text>

                {/* Topics and Sentiments */}
                {review.topics && review.topics.length > 0 && (
                  <VStack align="start" spacing={2}>
                    {review.topics.map((topic, i) => (
                      <HStack key={i} spacing={2} flexWrap="wrap">
                        <Badge colorScheme="blue" fontSize="xs">
                          {topic}
                        </Badge>
                        {review.sentiments && review.sentiments[i] && (
                          <Badge
                            fontSize="xs"
                            colorScheme={
                              review.sentiments[i] === "отрицательно"
                                ? "red"
                                : review.sentiments[i] === "положительно"
                                  ? "green"
                                  : "gray"
                            }
                          >
                            {review.sentiments[i]}
                          </Badge>
                        )}
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.total > 0 && (
        <Box mt={8}>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={changePage}
            onLimitChange={changeLimit}
            loading={loading}
          />
        </Box>
      )}

      {/* No Data State */}
      {!loading && !error && reviews.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            Отзывы не найдены
          </Text>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Попробуйте изменить фильтры или обновить данные
          </Text>
          <Button onClick={refresh} colorScheme="brand">
            Обновить данные
          </Button>
        </Box>
      )}
    </Box>
  );
}
