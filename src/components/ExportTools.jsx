import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Icon,
    Text,
    VStack,
    HStack,
    useToast,
    Tooltip
} from "@chakra-ui/react";
import { FiDownload, FiFileText, FiImage, FiShare2, FiMail } from "react-icons/fi";

export default function ExportTools({ data, filters }) {
    const toast = useToast();

    const exportToCSV = () => {
        try {
            // Подготавливаем данные для CSV
            const headers = [
                'ID',
                'Дата',
                'Заголовок',
                'Рейтинг',
                'Город',
                'Темы',
                'Настроения',
                'Текст'
            ];

            const csvData = data.map(item => [
                item.id || '',
                item.date || '',
                (item.title || '').replace(/"/g, '""'),
                item.rating || '',
                item.city || '',
                (item.topics || []).join('; '),
                (item.sentiments || []).join('; '),
                (item.text || '').replace(/"/g, '""').substring(0, 500) + '...'
            ]);

            // Создаем CSV контент
            const csvContent = [
                headers.join(','),
                ...csvData.map(row =>
                    row.map(cell => `"${cell}"`).join(',')
                )
            ].join('\n');

            // Скачиваем файл
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `reviews_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Экспорт завершен",
                description: `Выгружено ${data.length} отзывов в CSV формате`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка экспорта",
                description: "Не удалось экспортировать данные",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const exportToJSON = () => {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                totalRecords: data.length,
                appliedFilters: filters,
                reviews: data.map(item => ({
                    id: item.id,
                    date: item.date,
                    title: item.title,
                    text: item.text,
                    rating: item.rating,
                    city: item.city,
                    topics: item.topics,
                    sentiments: item.sentiments,
                    link: item.link
                }))
            };

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `reviews_export_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Экспорт завершен",
                description: `Выгружено ${data.length} отзывов в JSON формате`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка экспорта",
                description: "Не удалось экспортировать данные",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const generateReport = () => {
        try {
            // Генерируем текстовый отчет
            const stats = {
                total: data.length,
                positive: data.filter(r => r.sentiments?.includes("положительно")).length,
                negative: data.filter(r => r.sentiments?.includes("отрицательно")).length,
                neutral: data.filter(r => r.sentiments?.includes("нейтрально")).length
            };

            const validRatings = data.map(r => parseInt(r.rating)).filter(r => !isNaN(r));
            const avgRating = validRatings.length > 0
                ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(2)
                : 'Н/Д';

            const formatShare = (part, total) => {
                if (!total) return '0.0';
                return ((part / total) * 100).toFixed(1);
            };

            // Темы и настроения
            const topicSentimentMap = {};
            data.forEach(review => {
                review.topics?.forEach((topic, index) => {
                    if (!topicSentimentMap[topic]) {
                        topicSentimentMap[topic] = { total: 0, positive: 0, neutral: 0, negative: 0 };
                    }
                    const entry = topicSentimentMap[topic];
                    entry.total += 1;
                    const sentiment = review.sentiments?.[index];
                    if (sentiment === "положительно") entry.positive += 1;
                    if (sentiment === "отрицательно") entry.negative += 1;
                    if (sentiment === "нейтрально") entry.neutral += 1;
                });
            });

            const topTopics = Object.entries(topicSentimentMap)
                .sort(([, a], [, b]) => b.total - a.total)
                .slice(0, 5)
                .map(([topic, stats]) => {
                    const positiveShare = formatShare(stats.positive, stats.total);
                    const negativeShare = formatShare(stats.negative, stats.total);
                    return `${topic}: ${stats.total} упоминаний (позитив ${positiveShare}%, негатив ${negativeShare}%)`;
                });

            const criticalTopics = Object.entries(topicSentimentMap)
                .filter(([, stats]) => stats.total >= 5)
                .map(([topic, stats]) => ({
                    topic,
                    negativeRate: formatShare(stats.negative, stats.total),
                    negative: stats.negative,
                    total: stats.total
                }))
                .filter(item => Number(item.negativeRate) >= 40)
                .sort((a, b) => Number(b.negativeRate) - Number(a.negativeRate))
                .slice(0, 3)
                .map(item => `${item.topic} — ${item.negativeRate}% негатива (${item.negative} из ${item.total})`);

            const championTopics = Object.entries(topicSentimentMap)
                .filter(([, stats]) => stats.total >= 5)
                .map(([topic, stats]) => ({
                    topic,
                    positiveRate: formatShare(stats.positive, stats.total),
                    positive: stats.positive,
                    total: stats.total
                }))
                .filter(item => Number(item.positiveRate) >= 55)
                .sort((a, b) => Number(b.positiveRate) - Number(a.positiveRate))
                .slice(0, 3)
                .map(item => `${item.topic} — ${item.positiveRate}% позитива (${item.positive} из ${item.total})`);

            // Города
            const cityMap = {};
            data.forEach(review => {
                const city = review.city || "Не указан";
                cityMap[city] = (cityMap[city] || 0) + 1;
            });

            const topCities = Object.entries(cityMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([city, count]) => `${city}: ${count} отзывов`);

            const truncate = (text, limit = 220) => {
                if (!text) return "(текст отсутствует)";
                const cleaned = text.replace(/\s+/g, ' ').trim();
                return cleaned.length > limit ? `${cleaned.slice(0, limit)}…` : cleaned;
            };

            const formatQuotes = (sentiment) => {
                const samples = data
                    .filter(review => review.sentiments?.includes(sentiment))
                    .slice(0, 2)
                    .map(review => {
                        const rating = review.rating ? `${review.rating}★` : "без рейтинга";
                        const city = review.city ? `, ${review.city}` : "";
                        return `• [${rating}${city}] ${truncate(review.title || review.text, 140)}`;
                    });
                return samples.length > 0 ? samples.join('\n') : "• Нет данных";
            };

            const positiveQuotes = formatQuotes("положительно");
            const negativeQuotes = formatQuotes("отрицательно");
            const neutralQuotes = formatQuotes("нейтрально");

            const reportContent = `
ОТЧЕТ ПО АНАЛИЗУ ОТЗЫВОВ
Дата создания: ${new Date().toLocaleString('ru-RU')}

 ОБЩАЯ СТАТИСТИКА:
 - Всего отзывов: ${stats.total}
 - Положительных: ${stats.positive} (${formatShare(stats.positive, stats.total)}%)
 - Нейтральных: ${stats.neutral} (${formatShare(stats.neutral, stats.total)}%)
 - Отрицательных: ${stats.negative} (${formatShare(stats.negative, stats.total)}%)
 - Средний рейтинг: ${avgRating}

ТОП ОБСУЖДАЕМЫХ ТЕМ:
${topTopics.length ? topTopics.join('\n') : 'Нет данных'}

КРИТИЧЕСКИЕ ЗОНЫ (повышенный негатив):
${criticalTopics.length ? criticalTopics.join('\n') : 'Нет тем с превышением порога'}

ТОЧКИ ВОСТОРГА (высокий позитив):
${championTopics.length ? championTopics.join('\n') : 'Нет ярко выраженных лидеров'}

ГЕОГРАФИЯ ОБРАТНОЙ СВЯЗИ:
${topCities.length ? topCities.join('\n') : 'Нет данных по городам'}

ЖИВЫЕ ЦИТАТЫ:
Позитив:
${positiveQuotes}

Нейтральные:
${neutralQuotes}

Негатив:
${negativeQuotes}

ПРИМЕНЕННЫЕ ФИЛЬТРЫ:
- Период: ${filters.dateFrom ? `от ${filters.dateFrom}` : 'без ограничений'} ${filters.dateTo ? `до ${filters.dateTo}` : ''}
- Рейтинг: ${filters.ratingRange[0]}-${filters.ratingRange[1]} звезд
- Выбранные темы: ${filters.topics.join(', ') || 'Все'}
- Настроения: ${filters.sentiments.join(', ') || 'Все'}
- Города: ${filters.cities.join(', ') || 'Все'}
- Поиск: ${filters.searchText || 'Не применен'}

Отчет создан системой аналитики Газпромбанк.Тех
      `.trim();

            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.txt`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Отчет создан",
                description: "Аналитический отчет успешно сформирован",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Ошибка генерации отчета",
                description: "Не удалось создать отчет",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const shareData = () => {
        if (navigator.share && data.length < 100) {
            navigator.share({
                title: 'Аналитика отзывов Газпромбанк',
                text: `Анализ ${data.length} отзывов показывает интересные инсайты`,
                url: window.location.href,
            }).catch(() => {
                copyToClipboard();
            });
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        const summary = `
📊 Аналитика отзывов Газпромбанк

Всего отзывов: ${data.length}
Положительных: ${data.filter(r => r.sentiments?.includes("положительно")).length}
Отрицательных: ${data.filter(r => r.sentiments?.includes("отрицательно")).length}

Ссылка: ${window.location.href}
    `.trim();

        navigator.clipboard.writeText(summary).then(() => {
            toast({
                title: "Скопировано",
                description: "Краткая сводка скопирована в буфер обмена",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
        });
    };

    const sendByEmail = () => {
        const subject = encodeURIComponent(`Аналитика отзывов - ${new Date().toLocaleDateString('ru-RU')}`);
        const body = encodeURIComponent(`
Здравствуйте!

Направляю аналитику по отзывам клиентов:
- Всего отзывов: ${data.length}
- Положительных: ${data.filter(r => r.sentiments?.includes("положительно")).length}
- Отрицательных: ${data.filter(r => r.sentiments?.includes("отрицательно")).length}

Подробная аналитика доступна по ссылке: ${window.location.href}

С уважением,
Система аналитики Газпромбанк.Тех
    `);

        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <Menu>
            <Tooltip label="Экспорт и поделиться данными" placement="left">
                <MenuButton
                    as={Button}
                    leftIcon={<Icon as={FiDownload} />}
                    size="sm"
                    colorScheme="brand"
                    variant="outline"
                >
                    Экспорт
                </MenuButton>
            </Tooltip>
            <MenuList>
                <VStack align="start" spacing={0} w="full">
                    <Text fontSize="xs" color="gray.500" px={3} py={1} fontWeight="bold">
                        ФОРМАТЫ ДАННЫХ
                    </Text>
                    <MenuItem onClick={exportToCSV} icon={<Icon as={FiFileText} />}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm">Скачать CSV</Text>
                            <Text fontSize="xs" color="gray.500">
                                {data.length} строк для Excel
                            </Text>
                        </VStack>
                    </MenuItem>
                    <MenuItem onClick={exportToJSON} icon={<Icon as={FiFileText} />}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm">Скачать JSON</Text>
                            <Text fontSize="xs" color="gray.500">
                                Структурированные данные
                            </Text>
                        </VStack>
                    </MenuItem>
                    <MenuItem onClick={generateReport} icon={<Icon as={FiFileText} />}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm">Создать отчет</Text>
                            <Text fontSize="xs" color="gray.500">
                                Текстовая сводка
                            </Text>
                        </VStack>
                    </MenuItem>
                </VStack>

                <MenuDivider />

                <VStack align="start" spacing={0} w="full">
                    <Text fontSize="xs" color="gray.500" px={3} py={1} fontWeight="bold">
                        ПОДЕЛИТЬСЯ
                    </Text>
                    <MenuItem onClick={shareData} icon={<Icon as={FiShare2} />}>
                        <Text fontSize="sm">Поделиться ссылкой</Text>
                    </MenuItem>
                    <MenuItem onClick={sendByEmail} icon={<Icon as={FiMail} />}>
                        <Text fontSize="sm">Отправить по почте</Text>
                    </MenuItem>
                </VStack>
            </MenuList>
        </Menu>
    );
}