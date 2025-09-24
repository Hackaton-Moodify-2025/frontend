import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    Button,
    Icon,
    useColorModeValue,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    List,
    ListItem,
    ListIcon,
    Divider
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
    FiBell,
    FiAlertTriangle,
    FiTrendingDown,
    FiUsers,
    FiMessageSquare,
    FiCheckCircle,
    FiClock,
    FiX
} from "react-icons/fi";

export default function LiveAlerts({ data }) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [alerts, setAlerts] = useState([]);
    const [newAlertsCount, setNewAlertsCount] = useState(0);

    // Генерация алертов на основе данных
    useEffect(() => {
        const generateAlerts = () => {
            const newAlerts = [];
            const now = new Date();

            // Анализ данных для алертов
            const totalReviews = data.length;
            const recentReviews = data.filter(r => {
                if (!r.date) return false;
                const reviewDate = new Date(r.date);
                const daysDiff = (now - reviewDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 1; // Последние 24 часа
            });

            const negativeReviews = data.filter(r => r.sentiments?.includes("отрицательно"));
            const recentNegative = recentReviews.filter(r => r.sentiments?.includes("отрицательно"));

            // Критические темы
            const criticalTopics = {};
            negativeReviews.forEach(review => {
                review.topics?.forEach(topic => {
                    criticalTopics[topic] = (criticalTopics[topic] || 0) + 1;
                });
            });

            const topCriticalTopic = Object.entries(criticalTopics)
                .sort(([, a], [, b]) => b - a)[0];

            // Средний рейтинг
            const validRatings = data.map(r => parseInt(r.rating)).filter(r => !isNaN(r) && r > 0);
            const avgRating = validRatings.length > 0
                ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
                : 0;

            // Алерт: Много негативных отзывов за сегодня
            if (recentNegative.length > 3) {
                newAlerts.push({
                    id: `negative_spike_${now.getTime()}`,
                    type: "critical",
                    title: "Всплеск негативных отзывов",
                    description: `Получено ${recentNegative.length} негативных отзывов за последние 24 часа`,
                    timestamp: now,
                    action: "Требуется немедленное внимание команды поддержки",
                    icon: FiTrendingDown
                });
            }

            // Алерт: Критически низкий рейтинг
            if (avgRating < 2.5 && validRatings.length >= 10) {
                newAlerts.push({
                    id: `low_rating_${now.getTime()}`,
                    type: "critical",
                    title: "Критически низкий рейтинг",
                    description: `Средний рейтинг составляет ${avgRating.toFixed(1)} из 5`,
                    timestamp: now,
                    action: "Необходим план по улучшению качества сервиса",
                    icon: FiAlertTriangle
                });
            }

            // Алерт: Проблемная тема
            if (topCriticalTopic && topCriticalTopic[1] >= 5) {
                newAlerts.push({
                    id: `topic_issue_${now.getTime()}`,
                    type: "warning",
                    title: `Проблемы с "${topCriticalTopic[0]}"`,
                    description: `${topCriticalTopic[1]} негативных упоминаний по данной теме`,
                    timestamp: now,
                    action: "Рекомендуется анализ процессов по данному направлению",
                    icon: FiMessageSquare
                });
            }

            // Алерт: Высокая активность
            if (recentReviews.length > 10) {
                newAlerts.push({
                    id: `high_activity_${now.getTime()}`,
                    type: "info",
                    title: "Повышенная активность клиентов",
                    description: `Получено ${recentReviews.length} отзывов за последние 24 часа`,
                    timestamp: now,
                    action: "Мониторинг качества обслуживания",
                    icon: FiUsers
                });
            }

            // Алерт: Недостаток данных
            if (totalReviews < 20) {
                newAlerts.push({
                    id: `low_data_${now.getTime()}`,
                    type: "info",
                    title: "Недостаточно данных для анализа",
                    description: `Всего ${totalReviews} отзывов в базе`,
                    timestamp: now,
                    action: "Рекомендуется расширить каналы сбора обратной связи",
                    icon: FiClock
                });
            }

            // Позитивный алерт
            const positiveReviews = data.filter(r => r.sentiments?.includes("положительно"));
            const positivityRate = totalReviews > 0 ? (positiveReviews.length / totalReviews * 100) : 0;

            if (positivityRate > 70) {
                newAlerts.push({
                    id: `positive_trend_${now.getTime()}`,
                    type: "success",
                    title: "Отличная работа!",
                    description: `${positivityRate.toFixed(1)}% положительных отзывов`,
                    timestamp: now,
                    action: "Продолжать в том же духе и изучить успешные практики",
                    icon: FiCheckCircle
                });
            }

            // Обновляем состояние только если есть новые алерты
            if (newAlerts.length > 0) {
                setAlerts(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const reallyNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));

                    if (reallyNewAlerts.length > 0) {
                        setNewAlertsCount(prev => prev + reallyNewAlerts.length);

                        // Показываем toast для критических алертов
                        reallyNewAlerts.forEach(alert => {
                            if (alert.type === "critical") {
                                toast({
                                    title: alert.title,
                                    description: alert.description,
                                    status: "error",
                                    duration: 8000,
                                    isClosable: true,
                                    position: "top-right"
                                });
                            }
                        });
                    }

                    return [...reallyNewAlerts, ...prev].slice(0, 20); // Ограничиваем 20 алертами
                });
            }
        };

        generateAlerts();

        // Обновляем алерты каждые 30 секунд (в реальной системе это может быть WebSocket)
        const interval = setInterval(generateAlerts, 30000);

        return () => clearInterval(interval);
    }, [data, toast]);

    const handleOpenAlerts = () => {
        setNewAlertsCount(0);
        onOpen();
    };

    const clearAlert = (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    const clearAllAlerts = () => {
        setAlerts([]);
    };

    const getAlertColor = (type) => {
        switch (type) {
            case "critical": return "red";
            case "warning": return "orange";
            case "success": return "green";
            default: return "blue";
        }
    };

    const getAlertStatus = (type) => {
        switch (type) {
            case "critical": return "error";
            case "warning": return "warning";
            case "success": return "success";
            default: return "info";
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Показываем только если есть алерты
    if (alerts.length === 0) {
        return null;
    }

    return (
        <>
            {/* Плавающая кнопка уведомлений */}
            <Box
                position="fixed"
                bottom={6}
                right={6}
                zIndex={1000}
            >
                <Button
                    leftIcon={<Icon as={FiBell} />}
                    colorScheme={alerts.some(a => a.type === "critical") ? "red" : "brand"}
                    size="lg"
                    borderRadius="full"
                    shadow="lg"
                    onClick={handleOpenAlerts}
                    position="relative"
                    _hover={{
                        transform: "scale(1.05)",
                        shadow: "xl"
                    }}
                    transition="all 0.2s"
                    animation={newAlertsCount > 0 ? "pulse 2s infinite" : "none"}
                >
                    Алерты
                    {newAlertsCount > 0 && (
                        <Badge
                            colorScheme="red"
                            variant="solid"
                            borderRadius="full"
                            position="absolute"
                            top="-1"
                            right="-1"
                            minW="20px"
                            h="20px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                        >
                            {newAlertsCount}
                        </Badge>
                    )}
                </Button>
            </Box>

            {/* Панель алертов */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        <HStack>
                            <Icon as={FiBell} color="brand.500" />
                            <Text>Живые алерты системы</Text>
                            <Badge colorScheme="brand" variant="subtle">
                                {alerts.length}
                            </Badge>
                        </HStack>
                    </DrawerHeader>

                    <DrawerBody>
                        <VStack align="stretch" spacing={4}>
                            {/* Контролы */}
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                    Последнее обновление: {formatTime(new Date())}
                                </Text>
                                <Button size="sm" variant="outline" onClick={clearAllAlerts}>
                                    Очистить все
                                </Button>
                            </HStack>

                            <Divider />

                            {/* Список алертов */}
                            <VStack align="stretch" spacing={3}>
                                {alerts.map((alert) => (
                                    <Alert
                                        key={alert.id}
                                        status={getAlertStatus(alert.type)}
                                        borderRadius="lg"
                                        flexDirection="column"
                                        alignItems="start"
                                        position="relative"
                                    >
                                        <Button
                                            position="absolute"
                                            top={1}
                                            right={1}
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => clearAlert(alert.id)}
                                        >
                                            <Icon as={FiX} />
                                        </Button>

                                        <HStack w="100%" pr={8}>
                                            <AlertIcon as={alert.icon} />
                                            <VStack align="start" spacing={1} flex={1}>
                                                <HStack justify="space-between" w="100%">
                                                    <AlertTitle fontSize="sm">
                                                        {alert.title}
                                                    </AlertTitle>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {formatTime(alert.timestamp)}
                                                    </Text>
                                                </HStack>
                                                <AlertDescription fontSize="xs">
                                                    {alert.description}
                                                </AlertDescription>
                                                {alert.action && (
                                                    <Text
                                                        fontSize="xs"
                                                        color={`${getAlertColor(alert.type)}.600`}
                                                        fontWeight="semibold"
                                                        mt={1}
                                                    >
                                                        💡 {alert.action}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </HStack>
                                    </Alert>
                                ))}
                            </VStack>

                            {/* Статистика алертов */}
                            <Box mt={6} p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" fontWeight="bold" mb={2}>
                                    📊 Статистика алертов
                                </Text>
                                <VStack spacing={1} align="start">
                                    <Text fontSize="xs" color="red.600">
                                        Критические: {alerts.filter(a => a.type === "critical").length}
                                    </Text>
                                    <Text fontSize="xs" color="orange.600">
                                        Предупреждения: {alerts.filter(a => a.type === "warning").length}
                                    </Text>
                                    <Text fontSize="xs" color="green.600">
                                        Позитивные: {alerts.filter(a => a.type === "success").length}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600">
                                        Информационные: {alerts.filter(a => a.type === "info").length}
                                    </Text>
                                </VStack>
                            </Box>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Стили для анимации */}
            <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
          100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
        }
      `}</style>
        </>
    );
}