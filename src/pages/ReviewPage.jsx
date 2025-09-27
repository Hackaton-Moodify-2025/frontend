import { useParams, useNavigate } from "react-router-dom";
import { Box, Text, Badge, HStack, Link, Image, Button, VStack, Spinner, Alert, AlertIcon, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import reviewsAPI from "../services/api";

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
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем аналитику (где есть все отзывы)
        const analyticsData = await reviewsAPI.getAnalytics();
        const foundReview = analyticsData.reviews.find(r => r.id === Number(id));

        if (foundReview) {
          setReview(foundReview);
        } else {
          setError('Отзыв не найден');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReview();
    }
  }, [id]);

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Загрузка отзыва...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box py={6}>
        <Alert status="error" rounded="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Ошибка загрузки</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!review) {
    return (
      <Box py={6}>
        <Text p={6}>Отзыв не найден</Text>
      </Box>
    );
  }

  const host = getHost(review.link);

  return (
    <Box py={6}>
      <Box bg="white" p={6} rounded="lg" boxShadow="md">
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
          <Text fontWeight="bold" fontSize="xl">{review.title}</Text>
        </HStack>

        <Text fontSize="sm" color="gray.600" mb={4}>
          {review.date} · {review.city} · ⭐ {review.rating}
        </Text>

        <Text mb={6}>{review.text}</Text>

        {review.topics && review.topics.length > 0 && (
          <VStack align="start" spacing={2} mb={6}>
            {review.topics.map((topic, i) => (
              <HStack key={i} spacing={2}>
                <Badge colorScheme="blue">{topic}</Badge>
                {review.sentiments && review.sentiments[i] && (
                  <Badge
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

        <Link href={review.link} isExternal mt={6} display="block" color="brand.500">
          Открыть оригинал ({host})
        </Link>
      </Box>
    </Box>
  );
}
