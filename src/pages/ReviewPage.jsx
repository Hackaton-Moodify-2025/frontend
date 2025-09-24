import { useParams, useNavigate } from "react-router-dom";
import { Box, Text, Badge, HStack, Link, Image, Button, VStack } from "@chakra-ui/react";
import { mockReviews } from "../mocks/reviews.js";
import { siteReviews } from "../mocks/siteReviews.js";

function getHost(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const review = mockReviews.predictions.find((p) => p.id === Number(id));
  const full = siteReviews.find((r) => r.id === Number(id));
  const merged = { ...review, ...full };

  if (!merged) return <Text p={6}>Отзыв не найден</Text>;

  const host = getHost(merged.link);

  return (
    <Box p={6} bg="white" rounded="lg" boxShadow="md">
      <Button mb={4} onClick={() => navigate(-1)} colorScheme="brand">
        ← Назад
      </Button>

      <HStack mb={4}>
        {host && (
          <Image
            src={`/logos/${host.split(".")[0]}.png`}
            alt={host}
            boxSize="24px"
          />
        )}
        <Text fontWeight="bold" fontSize="xl">{merged.title}</Text>
      </HStack>

      <Text fontSize="sm" color="gray.600" mb={4}>
        {merged.date} · {merged.city} · ⭐ {merged.rating}
      </Text>

      <Text mb={6}>{merged.text}</Text>

      <VStack align="start" spacing={2} mb={6}>
        {merged.topics.map((t, i) => (
          <HStack key={i} spacing={2}>
            <Badge colorScheme="blue">{t}</Badge>
            <Badge
              colorScheme={
                merged.sentiments[i] === "отрицательно"
                  ? "red"
                  : merged.sentiments[i] === "положительно"
                  ? "green"
                  : "gray"
              }
            >
              {merged.sentiments[i]}
            </Badge>
          </HStack>
        ))}
      </VStack>

      <Link href={merged.link} isExternal mt={6} display="block" color="brand.500">
        Открыть оригинал ({host})
      </Link>
    </Box>
  );
}
