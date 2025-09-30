import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    SimpleGrid,
    useColorModeValue,
    Icon,
    Tooltip,
    Wrap,
    WrapItem,
    Select,
    Button
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { FiType, FiTrendingUp, FiRefreshCw } from "react-icons/fi";
import { extractKeywords, extractBigrams, filterStopWords } from "../utils/textAnalysis";

export default function WordCloudAnalysis({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const [analysisType, setAnalysisType] = useState("all"); // all, positive, negative

    // Стоп-слова для фильтрации (используем из утилиты)
    const stopWords = new Set([
        "и", "в", "во", "не", "что", "он", "на", "я", "с", "со", "как", "а", "то", "все", "она", "так", "его", "но", "да", "ты", "к", "у",
        "же", "вы", "за", "бы", "по", "только", "ее", "мне", "было", "вот", "от", "меня", "еще", "нет", "о", "из", "ему", "теперь", "когда",
        "даже", "ну", "вдруг", "ли", "если", "уже", "или", "ни", "быть", "был", "него", "до", "вас", "нибудь", "опять", "уж", "вам", "ведь",
        "там", "потом", "себя", "ничего", "ей", "может", "они", "тут", "где", "есть", "надо", "ней", "для", "мы", "тебя", "их", "чем", "была",
        "сам", "чтоб", "без", "будто", "чего", "раз", "тоже", "себе", "под", "будет", "ж", "тогда", "кто", "этот", "того", "потому", "этого",
        "какой", "совсем", "ним", "здесь", "этом", "один", "почти", "мой", "тем", "чтобы", "нее", "сейчас", "были", "куда", "зачем", "всех",
        "никогда", "можно", "при", "наконец", "два", "об", "другой", "хоть", "после", "над", "больше", "тот", "через", "эти", "нас", "про",
        "всего", "них", "какая", "много", "разве", "три", "эту", "моя", "впрочем", "хорошо", "свою", "этой", "перед", "иногда", "лучше", "чуть",
        "том", "нельзя", "такой", "им", "более", "всегда", "конечно", "всю", "между"
    ]);

    // Извлечение и анализ слов
    const analyzeWords = useMemo(() => {
        let filteredData = data;

        // Фильтрация по типу анализа
        if (analysisType === "positive") {
            filteredData = data.filter(item => item.sentiments?.includes("положительно"));
        } else if (analysisType === "negative") {
            filteredData = data.filter(item => item.sentiments?.includes("отрицательно"));
        }

        const wordCounts = {};
        const phrases = {};
        const topicWords = {};

        filteredData.forEach(review => {
            if (review.text) {
                // Очистка и разбиение на слова
                const words = review.text
                    .toLowerCase()
                    .replace(/[^\p{L}\s]/gu, ' ')
                    .split(/\s+/)
                    .filter(word =>
                        word.length > 3 &&
                        !stopWords.has(word) &&
                        !/^\d+$/.test(word)
                    );

                // Подсчет отдельных слов
                words.forEach(word => {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                });

                // Извлечение биграмм (двухсловных фраз)
                for (let i = 0; i < words.length - 1; i++) {
                    const phrase = `${words[i]} ${words[i + 1]}`;
                    if (phrase.length > 8) {
                        phrases[phrase] = (phrases[phrase] || 0) + 1;
                    }
                }

                // Слова по темам
                review.topics?.forEach(topic => {
                    if (!topicWords[topic]) {
                        topicWords[topic] = {};
                    }
                    words.forEach(word => {
                        topicWords[topic][word] = (topicWords[topic][word] || 0) + 1;
                    });
                });
            }
        });

        // Сортировка и ограничение результатов
        const topWords = Object.entries(wordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 30)
            .map(([word, count]) => ({ word, count, type: 'word' }));

        const topPhrases = Object.entries(phrases)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([phrase, count]) => ({ word: phrase, count, type: 'phrase' }));

        // Топ слова по темам
        const topicTopWords = {};
        Object.entries(topicWords).forEach(([topic, words]) => {
            topicTopWords[topic] = Object.entries(words)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([word, count]) => ({ word, count }));
        });

        return {
            words: topWords,
            phrases: topPhrases,
            byTopics: topicTopWords,
            totalWords: Object.values(wordCounts).reduce((a, b) => a + b, 0)
        };
    }, [data, analysisType]);

    // Цветовая схема для слов
    const getWordColor = (count, maxCount) => {
        const intensity = count / maxCount;
        if (analysisType === "positive") {
            return intensity > 0.8 ? "green.600" :
                intensity > 0.5 ? "green.500" :
                    intensity > 0.3 ? "green.400" : "green.300";
        } else if (analysisType === "negative") {
            return intensity > 0.8 ? "red.600" :
                intensity > 0.5 ? "red.500" :
                    intensity > 0.3 ? "red.400" : "red.300";
        } else {
            return intensity > 0.8 ? "brand.600" :
                intensity > 0.5 ? "brand.500" :
                    intensity > 0.3 ? "brand.400" : "brand.300";
        }
    };

    const getFontSize = (count, maxCount) => {
        const intensity = count / maxCount;
        return intensity > 0.8 ? "xl" :
            intensity > 0.5 ? "lg" :
                intensity > 0.3 ? "md" : "sm";
    };

    const maxWordCount = Math.max(...analyzeWords.words.map(w => w.count), 1);
    const maxPhraseCount = Math.max(...analyzeWords.phrases.map(p => p.count), 1);

    const getAnalysisTitle = () => {
        switch (analysisType) {
            case "positive": return "Позитивные отзывы";
            case "negative": return "Негативные отзывы";
            default: return "Все отзывы";
        }
    };

    const getAnalysisColor = () => {
        switch (analysisType) {
            case "positive": return "green";
            case "negative": return "red";
            default: return "brand";
        }
    };

    return (
        <Box
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            shadow="lg"
        >
            <VStack align="stretch" spacing={6}>
                {/* Заголовок и контролы */}
                <HStack justify="space-between">
                    <HStack>
                        <Icon as={FiType} color="brand.500" boxSize={5} />
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                            Анализ ключевых слов
                        </Text>
                    </HStack>
                    <HStack spacing={3}>
                        <Select
                            size="sm"
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                            w="200px"
                        >
                            <option value="all">Все отзывы</option>
                            <option value="positive">Только позитивные</option>
                            <option value="negative">Только негативные</option>
                        </Select>
                        <Badge colorScheme={getAnalysisColor()} variant="subtle" px={3} py={1} borderRadius="full">
                            {analyzeWords.totalWords} слов
                        </Badge>
                    </HStack>
                </HStack>

                {/* Статистика */}
                <SimpleGrid columns={3} spacing={4}>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color={`${getAnalysisColor()}.500`}>
                            {analyzeWords.words.length}
                        </Text>
                        <Text fontSize="sm" color="gray.600">уникальных слов</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color={`${getAnalysisColor()}.500`}>
                            {analyzeWords.phrases.length}
                        </Text>
                        <Text fontSize="sm" color="gray.600">ключевых фраз</Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color={`${getAnalysisColor()}.500`}>
                            {Object.keys(analyzeWords.byTopics).length}
                        </Text>
                        <Text fontSize="sm" color="gray.600">тематических групп</Text>
                    </Box>
                </SimpleGrid>

                {/* Word Cloud - топ слова */}
                <Box>
                    <Text fontSize="md" fontWeight="semibold" mb={4} color={`${getAnalysisColor()}.600`}>
                        📝 Часто упоминаемые слова ({getAnalysisTitle()})
                    </Text>
                    <Box
                        p={6}
                        bg={useColorModeValue(`${getAnalysisColor()}.50`, `${getAnalysisColor()}.900`)}
                        borderRadius="lg"
                        border="1px"
                        borderColor={`${getAnalysisColor()}.200`}
                    >
                        <Wrap spacing={2} justify="center">
                            {analyzeWords.words.map((item, index) => (
                                <WrapItem key={index}>
                                    <Tooltip
                                        label={`"${item.word}" упоминается ${item.count} раз`}
                                        placement="top"
                                    >
                                        <Badge
                                            colorScheme={getAnalysisColor()}
                                            variant="subtle"
                                            fontSize={getFontSize(item.count, maxWordCount)}
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            cursor="help"
                                            _hover={{ transform: "scale(1.05)" }}
                                            transition="all 0.2s"
                                        >
                                            {item.word} ({item.count})
                                        </Badge>
                                    </Tooltip>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                </Box>

                {/* Ключевые фразы */}
                {analyzeWords.phrases.length > 0 && (
                    <Box>
                        <Text fontSize="md" fontWeight="semibold" mb={4} color={`${getAnalysisColor()}.600`}>
                            🔍 Популярные фразы
                        </Text>
                        <Wrap spacing={2}>
                            {analyzeWords.phrases.map((item, index) => (
                                <WrapItem key={index}>
                                    <Tooltip
                                        label={`Фраза встречается ${item.count} раз`}
                                        placement="top"
                                    >
                                        <Badge
                                            colorScheme={getAnalysisColor()}
                                            variant="outline"
                                            fontSize="sm"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            cursor="help"
                                        >
                                            "{item.word}" ({item.count})
                                        </Badge>
                                    </Tooltip>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                )}

                {/* Анализ по темам */}
                {Object.keys(analyzeWords.byTopics).length > 0 && (
                    <Box>
                        <Text fontSize="md" fontWeight="semibold" mb={4} color={`${getAnalysisColor()}.600`}>
                            🏷️ Топ слова по темам
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {Object.entries(analyzeWords.byTopics).slice(0, 6).map(([topic, words]) => (
                                <Box
                                    key={topic}
                                    p={4}
                                    bg={useColorModeValue("gray.50", "gray.700")}
                                    borderRadius="lg"
                                    border="1px"
                                    borderColor="gray.200"
                                >
                                    <Text fontSize="sm" fontWeight="bold" mb={2} color="brand.600">
                                        {topic}
                                    </Text>
                                    <Wrap spacing={1}>
                                        {words.map((wordData, index) => (
                                            <WrapItem key={index}>
                                                <Badge size="sm" colorScheme="gray" variant="subtle">
                                                    {wordData.word} ({wordData.count})
                                                </Badge>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Box>
                )}

                {/* Инсайты */}
                {analyzeWords.words.length > 0 && (
                    <Box
                        p={4}
                        bg={`${getAnalysisColor()}.50`}
                        borderRadius="lg"
                        border="1px"
                        borderColor={`${getAnalysisColor()}.200`}
                    >
                        <Text fontSize="sm" fontWeight="bold" color={`${getAnalysisColor()}.700`} mb={1}>
                            💡 Семантический анализ
                        </Text>
                        <Text fontSize="xs" color={`${getAnalysisColor()}.600`}>
                            Самое частое слово: <strong>"{analyzeWords.words[0]?.word}"</strong> (упоминается {analyzeWords.words[0]?.count} раз).
                            {analyzeWords.phrases.length > 0 && (
                                <>
                                    {" "}Популярная фраза: <strong>"{analyzeWords.phrases[0]?.word}"</strong>.
                                </>
                            )}
                            {" "}Анализ основан на {analyzeWords.totalWords} словах из текстов отзывов.
                        </Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
}