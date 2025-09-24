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

            // Топ темы
            const topicsCount = {};
            data.forEach(review => {
                review.topics?.forEach(topic => {
                    topicsCount[topic] = (topicsCount[topic] || 0) + 1;
                });
            });

            const topTopics = Object.entries(topicsCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([topic, count]) => `${topic}: ${count} упоминаний`)
                .join('\n');

            const reportContent = `
ОТЧЕТ ПО АНАЛИЗУ ОТЗЫВОВ
Дата создания: ${new Date().toLocaleString('ru-RU')}

ОБЩАЯ СТАТИСТИКА:
- Всего отзывов: ${stats.total}
- Положительных: ${stats.positive} (${(stats.positive / stats.total * 100).toFixed(1)}%)
- Нейтральных: ${stats.neutral} (${(stats.neutral / stats.total * 100).toFixed(1)}%)
- Отрицательных: ${stats.negative} (${(stats.negative / stats.total * 100).toFixed(1)}%)
- Средний рейтинг: ${avgRating}

ТОП ОБСУЖДАЕМЫХ ТЕМ:
${topTopics}

ПРИМЕНЕННЫЕ ФИЛЬТРЫ:
- Период: ${filters.dateRange[0]}-${filters.dateRange[1]} дней
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