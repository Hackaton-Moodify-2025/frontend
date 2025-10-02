import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Textarea,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, DownloadIcon } from "@chakra-ui/icons";

const MLPredictionPage = () => {
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState("single"); // "single" or "json"
  const [jsonInput, setJsonInput] = useState("");
  const [predictions, setPredictions] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mlHealth, setMlHealth] = useState(null);
  const toast = useToast();

  // Проверка здоровья ML-сервиса
  const checkMLHealth = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/ml/health");
      const data = await response.json();
      setMlHealth(data);

      toast({
        title: "ML Service Status",
        description: data.status === "healthy" ? "Service is running" : "Service unavailable",
        status: data.status === "healthy" ? "success" : "error",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Cannot connect to ML service",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Отправка запроса на предсказание
  const handlePredict = async () => {
    setLoading(true);
    setPredictions(null);
    setRawResponse(null);

    try {
      let requestData;

      if (inputMode === "json") {
        // JSON режим
        if (!jsonInput.trim()) {
          throw new Error("Введите JSON данные");
        }

        try {
          const parsed = JSON.parse(jsonInput);
          requestData = parsed;

          // Валидация структуры
          if (!parsed.data || !Array.isArray(parsed.data)) {
            throw new Error('JSON должен содержать поле "data" с массивом отзывов');
          }
        } catch (e) {
          throw new Error("Некорректный JSON формат: " + e.message);
        }
      } else {
        // Обычный режим
        if (!inputText.trim()) {
          throw new Error("Введите текст отзыва");
        }

        requestData = {
          data: [
            {
              id: 1,
              text: inputText,
            },
          ],
        };
      }

      const response = await fetch("http://localhost:8080/api/v1/ml/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get predictions");
      }

      const data = await response.json();
      setPredictions(data.predictions);
      setRawResponse(data);

      toast({
        title: "Успешно",
        description: `Обработано ${data.predictions.length} отзыв(ов)`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Пример отзыва
  const loadExample = () => {
    if (inputMode === "json") {
      setJsonInput(JSON.stringify({
        "data": [
          {
            "id": 1,
            "text": "Очень понравилось обслуживание в отделении, но мобильное приложение часто зависает."
          },
          {
            "id": 2,
            "text": "Кредитную карту одобрили быстро, но лимит слишком маленький."
          },
          {
            "id": 3,
            "text": "Отличный кэшбек и бонусы! Служба поддержки работает круглосуточно."
          }
        ]
      }, null, 2));
    } else {
      setInputText(
        "Очень понравилось обслуживание в отделении, менеджеры вежливые и компетентные. Но мобильное приложение постоянно зависает, невозможно нормально пользоваться. Кэшбек начисляется вовремя, это плюс. А вот комиссии за переводы очень высокие, нужно что-то делать с этим."
      );
    }
  };

  const getSentimentColor = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("положительно") || s.includes("positive") || s.includes("pos")) {
      return "green";
    } else if (s.includes("отрицательно") || s.includes("negative") || s.includes("neg")) {
      return "red";
    } else if (s.includes("нейтрально") || s.includes("neutral")) {
      return "gray";
    }
    return "blue";
  };

  const getSentimentIcon = (sentiment) => {
    const s = sentiment?.toLowerCase() || "";
    if (s.includes("положительно") || s.includes("positive") || s.includes("pos")) {
      return "😊";
    } else if (s.includes("отрицательно") || s.includes("negative") || s.includes("neg")) {
      return "😞";
    } else if (s.includes("нейтрально") || s.includes("neutral")) {
      return "😐";
    }
    return "🤔";
  };

  // Скачивание JSON файла
  const downloadJSON = () => {
    if (!rawResponse) return;

    const dataStr = JSON.stringify(rawResponse, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `predictions_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Файл сохранен",
      description: "JSON ответ успешно скачан",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Заголовок */}
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            🤖 ML Prediction Service
          </Heading>
          <Text color="gray.600">
            Анализ тем и тональности отзывов на основе машинного обучения
          </Text>
        </Box>

        {/* Статус и информация */}
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>ML Service</StatLabel>
                  <StatNumber fontSize="lg">
                    {mlHealth ? (
                      <HStack>
                        <Icon
                          as={CheckCircleIcon}
                          color={mlHealth.status === "healthy" ? "green.500" : "red.500"}
                        />
                        <Text>{mlHealth.status === "healthy" ? "Online" : "Offline"}</Text>
                      </HStack>
                    ) : (
                      "Unknown"
                    )}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card>
              <CardBody>
                <VStack spacing={2}>
                  <Button colorScheme="blue" size="sm" w="full" onClick={checkMLHealth}>
                    Проверить статус
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Основная форма */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Анализ отзывов</Heading>
              <HStack>
                <Button
                  size="sm"
                  colorScheme={inputMode === "single" ? "blue" : "gray"}
                  onClick={() => setInputMode("single")}
                >
                  Один отзыв
                </Button>
                <Button
                  size="sm"
                  colorScheme={inputMode === "json" ? "blue" : "gray"}
                  onClick={() => setInputMode("json")}
                >
                  JSON (множество)
                </Button>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {inputMode === "single" ? (
                <Box>
                  <HStack mb={2} justify="space-between">
                    <Text fontWeight="semibold">Текст отзыва:</Text>
                    <Button size="sm" colorScheme="purple" variant="outline" onClick={loadExample}>
                      Загрузить пример
                    </Button>
                  </HStack>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Введите текст отзыва для анализа..."
                    rows={8}
                    resize="vertical"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Символов: {inputText.length}
                  </Text>
                </Box>
              ) : (
                <Box>
                  <HStack mb={2} justify="space-between">
                    <Text fontWeight="semibold">JSON данные:</Text>
                    <Button size="sm" colorScheme="purple" variant="outline" onClick={loadExample}>
                      Загрузить пример
                    </Button>
                  </HStack>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='{"data": [{"id": 1, "text": "Отзыв 1"}, {"id": 2, "text": "Отзыв 2"}]}'
                    rows={12}
                    resize="vertical"
                    fontFamily="monospace"
                    fontSize="sm"
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Формат: {`{"data": [{"id": number, "text": "string"}]}`}
                  </Text>
                </Box>
              )}

              <Button
                colorScheme="blue"
                size="lg"
                onClick={handlePredict}
                isLoading={loading}
                loadingText="Анализируем..."
                leftIcon={loading ? <Spinner size="sm" /> : undefined}
              >
                Проанализировать
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Результаты предсказания */}
        {predictions && Array.isArray(predictions) && (
          <VStack spacing={6} align="stretch">
            {/* Общая статистика */}
            <Card bg="blue.50" borderColor="blue.200" borderWidth={2}>
              <CardHeader>
                <Heading size="md" color="blue.700">
                  📊 Результаты анализа ({predictions.length} отзыв(ов))
                </Heading>
              </CardHeader>
              <CardBody>
                <StatGroup>
                  <Stat>
                    <StatLabel>Обработано отзывов</StatLabel>
                    <StatNumber>{predictions.length}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Всего тем</StatLabel>
                    <StatNumber>
                      {predictions.reduce((sum, p) => sum + p.topics.length, 0)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Положительных</StatLabel>
                    <StatNumber color="green.500">
                      {predictions.reduce(
                        (sum, p) => sum + p.sentiments.filter((s) => s === "положительно").length,
                        0
                      )}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Отрицательных</StatLabel>
                    <StatNumber color="red.500">
                      {predictions.reduce(
                        (sum, p) => sum + p.sentiments.filter((s) => s === "отрицательно").length,
                        0
                      )}
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </CardBody>
            </Card>

            {/* Результаты для каждого отзыва */}
            {predictions.map((prediction, idx) => (
              <Card key={prediction.id} variant="outline" borderWidth={2}>
                <CardHeader bg="gray.50">
                  <HStack justify="space-between">
                    <Heading size="sm">
                      Отзыв #{prediction.id}
                    </Heading>
                    <Badge colorScheme="purple" fontSize="md">
                      {prediction.topics.length} {prediction.topics.length === 1 ? "тема" : "темы/тем"}
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Темы и тональности */}
                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3}>
                      {prediction.topics.map((topic, index) => (
                        <Card key={index} variant="outline" bg="white" size="sm">
                          <CardBody>
                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between">
                                <Text fontWeight="semibold" fontSize="sm">{topic}</Text>
                                <Text fontSize="xl">
                                  {getSentimentIcon(prediction.sentiments[index])}
                                </Text>
                              </HStack>
                              <Badge
                                colorScheme={getSentimentColor(prediction.sentiments[index])}
                                fontSize="xs"
                                p={2}
                                borderRadius="md"
                                textAlign="center"
                              >
                                {prediction.sentiments[index].toUpperCase()}
                              </Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            ))}

            {/* Raw JSON Response */}
            {rawResponse && (
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="sm">JSON Ответ</Heading>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<DownloadIcon />}
                        colorScheme="green"
                        onClick={downloadJSON}
                      >
                        Скачать JSON
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
                          toast({
                            title: "Скопировано",
                            status: "success",
                            duration: 2000,
                          });
                        }}
                      >
                        Копировать
                      </Button>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Code
                    display="block"
                    whiteSpace="pre"
                    p={4}
                    borderRadius="md"
                    fontSize="sm"
                    overflowX="auto"
                  >
                    {JSON.stringify(rawResponse, null, 2)}
                  </Code>
                </CardBody>
              </Card>
            )}
          </VStack>
        )}

        {/* Документация API */}
        <Card>
          <CardHeader>
            <Heading size="md">📚 API Documentation</Heading>
          </CardHeader>
          <CardBody>
            <Tabs colorScheme="blue">
              <TabList>
                <Tab>POST /predict</Tab>
                <Tab>GET /health</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="semibold">Endpoint: POST /api/v1/ml/predict</Text>
                    <Box>
                      <Text mb={2}>Request body:</Text>
                      <Code display="block" p={4} borderRadius="md" whiteSpace="pre">
                        {JSON.stringify(
                          {
                            data: [
                              {
                                id: 1,
                                text: "Пример текста отзыва...",
                              },
                            ],
                          },
                          null,
                          2
                        )}
                      </Code>
                    </Box>
                    <Box>
                      <Text mb={2}>Response:</Text>
                      <Code display="block" p={4} borderRadius="md" whiteSpace="pre">
                        {JSON.stringify(
                          {
                            predictions: [
                              {
                                id: 1,
                                topics: ["Тема 1", "Тема 2"],
                                sentiments: ["положительно", "отрицательно"],
                              },
                            ],
                          },
                          null,
                          2
                        )}
                      </Code>
                    </Box>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Text fontWeight="semibold">Endpoint: GET /api/v1/ml/health</Text>
                    <Text>Проверка состояния ML-сервиса</Text>
                    <Box>
                      <Text mb={2}>Response:</Text>
                      <Code display="block" p={4} borderRadius="md" whiteSpace="pre">
                        {JSON.stringify(
                          {
                            status: "healthy",
                            model_loaded: true,
                          },
                          null,
                          2
                        )}
                      </Code>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

      </VStack>
    </Container>
  );
};

export default MLPredictionPage;
