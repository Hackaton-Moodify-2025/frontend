import { useState } from "react";
import {
  Box, SimpleGrid, Select, HStack, Text, Link, Badge, VStack, IconButton, Image, Flex
} from "@chakra-ui/react";
import { mockReviews } from "../mocks/reviews.js";
import { siteReviews } from "../mocks/siteReviews.js";
import { FaTh, FaList } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

function getHost(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const merged = mockReviews.predictions.map((p) => {
    const full = siteReviews.find((r) => r.id === p.id);
    return { ...p, ...full };
  });

  let filtered = merged;
  if (selectedTopic) filtered = filtered.filter((i) => i.topics.includes(selectedTopic));
  if (selectedSentiment) filtered = filtered.filter((i) => i.sentiments.includes(selectedSentiment));

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
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
            >
              {mockReviews.topics_used.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>

            <Select
              placeholder="Фильтр по тональности"
              minW={{ base: "auto", md: "220px" }}
              w={{ base: "full", md: "auto" }}
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)" }}
            >
              <option value="положительно">Положительно</option>
              <option value="нейтрально">Нейтрально</option>
              <option value="отрицательно">Отрицательно</option>
            </Select>
          </HStack>

          <HStack spacing={2}>
            <IconButton 
              icon={<FaTh />} 
              onClick={() => setViewMode("grid")} 
              aria-label="Grid"
              colorScheme={viewMode === "grid" ? "brand" : "gray"}
              variant={viewMode === "grid" ? "solid" : "ghost"}
            />
            <IconButton 
              icon={<FaList />} 
              onClick={() => setViewMode("list")} 
              aria-label="List"
              colorScheme={viewMode === "list" ? "brand" : "gray"}
              variant={viewMode === "list" ? "solid" : "ghost"}
            />
          </HStack>
        </Flex>
      </Box>

      <SimpleGrid 
        columns={viewMode === "grid" ? { base: 1, md: 2, lg: 3, xl: 4 } : 1} 
        spacing={6}
      >
        {filtered.map((item) => {
          const host = getHost(item.link);
          return (
            <Box 
              key={item.id} 
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
                  />
                )}
                <Link
                  as={RouterLink}
                  to={`/review/${item.id}`}
                  fontWeight="bold"
                  color="brand.500"
                >
                  {item.title}
                </Link>
              </Flex>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {item.date} · {item.city} · ⭐ {item.rating}
              </Text>
              <Text noOfLines={viewMode === "grid" ? 3 : 6} fontSize="sm" color="gray.800">
                {item.text}
              </Text>

              {/* Темы + предикты */}
              <VStack align="start" mt={2}>
                {item.topics.map((t, i) => (
                  <HStack key={i} spacing={2}>
                    <Badge colorScheme="blue">{t}</Badge>
                    <Badge
                      colorScheme={
                        item.sentiments[i] === "отрицательно"
                          ? "red"
                          : item.sentiments[i] === "положительно"
                          ? "green"
                          : "gray"
                      }
                    >
                      {item.sentiments[i]}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
