// Утилита для фильтрации стоп-слов в текстовой аналитике

// Расширенный список стоп-слов для русского языка
const stopWords = new Set([
    // Союзы и предлоги
    'и', 'в', 'на', 'с', 'по', 'для', 'от', 'к', 'о', 'об', 'за', 'до', 'из', 'у', 'во', 'со',
    'а', 'но', 'да', 'или', 'если', 'то', 'что', 'как', 'где', 'куда', 'когда', 'почему',
    'через', 'при', 'под', 'над', 'без', 'между', 'среди', 'около', 'вокруг', 'против',

    // Местоимения
    'это', 'тот', 'та', 'те', 'этот', 'эта', 'эти', 'все', 'всё', 'каждый', 'любой',
    'мне', 'меня', 'мой', 'моя', 'моё', 'мои', 'ты', 'тебя', 'твой', 'твоя', 'твоё', 'твои',
    'он', 'она', 'оно', 'они', 'его', 'её', 'их', 'ему', 'ей', 'им', 'них', 'нём', 'ней',

    // Глаголы-связки
    'быть', 'есть', 'был', 'была', 'было', 'были', 'будет', 'будут', 'буду', 'будешь',

    // Отрицания и частицы
    'не', 'ни', 'нет', 'никак', 'никто', 'ничто', 'нигде', 'никуда', 'никогда',

    // Наречия и усилители
    'очень', 'более', 'менее', 'самый', 'тоже', 'также', 'ещё', 'уже', 'только', 'лишь',
    'слишком', 'довольно', 'весьма', 'крайне', 'совсем', 'абсолютно', 'полностью',

    // Банковские термины (слишком общие)
    'банк', 'банка', 'банке', 'банку', 'банком', 'банков', 'банкам', 'банками',
    'карта', 'карты', 'карте', 'карту', 'картой', 'карт', 'картам', 'картами',
    'деньги', 'денег', 'деньгам', 'деньгами', 'рубль', 'рублей', 'рублям', 'рублями',
    'газпром', 'газпромбанк', 'газпрома', 'газпромбанка',

    // Общие слова в отзывах
    'отзыв', 'отзыва', 'отзыву', 'отзывом', 'отзывы', 'отзывов', 'отзывам', 'отзывами',
    'года', 'год', 'лет', 'дней', 'месяц', 'месяца', 'месяцев', 'время', 'времени',
    'том', 'была', 'были', 'будет', 'может', 'можно', 'нужно', 'надо', 'хочу', 'хочется',

    // Вводные конструкции
    'конечно', 'разумеется', 'естественно', 'кстати', 'впрочем', 'однако', 'тем', 'более',
    'кроме', 'того', 'помимо', 'этого', 'итак', 'таким', 'образом', 'следовательно'
]);

/**
 * Фильтрует стоп-слова из текста и возвращает очищенную строку
 * @param {string} text - исходный текст
 * @returns {string} - текст без стоп-слов
 */
export const filterStopWords = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, ' ') // Убираем все символы кроме букв и пробелов
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word) // Убираем чисто числовые значения
        )
        .join(' ');
};

/**
 * Извлекает ключевые слова из текста с их частотой
 * @param {string} text - исходный текст
 * @param {number} minLength - минимальная длина слова (по умолчанию 3)
 * @returns {Array} - массив объектов {word, count}
 */
export const extractKeywords = (text, minLength = 3) => {
    if (!text) return [];

    const wordCounts = {};

    text
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, ' ')
        .split(/\s+/)
        .filter(word =>
            word.length >= minLength &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word)
        )
        .forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

    return Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);
};

/**
 * Извлекает биграммы (фразы из двух слов) из текста
 * @param {string} text - исходный текст
 * @returns {Array} - массив объектов {phrase, count}
 */
export const extractBigrams = (text) => {
    if (!text) return [];

    const phraseCounts = {};
    const words = text
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, ' ')
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word)
        );

    for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (phrase.length > 6) { // Минимальная длина фразы
            phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
    }

    return Object.entries(phraseCounts)
        .map(([phrase, count]) => ({ phrase, count }))
        .sort((a, b) => b.count - a.count);
};

/**
 * Проверяет, является ли слово стоп-словом
 * @param {string} word - слово для проверки
 * @returns {boolean}
 */
export const isStopWord = (word) => {
    return stopWords.has(word.toLowerCase());
};

/**
 * Добавляет новые стоп-слова в список
 * @param {Array|string} words - слово или массив слов для добавления
 */
export const addStopWords = (words) => {
    const wordsArray = Array.isArray(words) ? words : [words];
    wordsArray.forEach(word => stopWords.add(word.toLowerCase()));
};

export default {
    filterStopWords,
    extractKeywords,
    extractBigrams,
    isStopWord,
    addStopWords
};