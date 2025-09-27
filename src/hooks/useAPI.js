import { useState, useEffect, useCallback } from 'react';
import reviewsAPI from '../services/api';

// Hook for paginated reviews with filters
export const useReviews = (initialFilters = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        topic: '',
        sentiment: '',
        ...initialFilters
    });

    const fetchReviews = useCallback(async (customParams = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
                ...customParams
            };

            console.log('Fetching reviews with params:', params);

            const data = await reviewsAPI.getReviews(params);

            setReviews(data.reviews || []);
            setPagination({
                page: data.page || 1,
                limit: data.limit || 20,
                total: data.total || 0,
                totalPages: data.total_pages || 0
            });
        } catch (err) {
            setError(err.message);
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    // Load initial data
    useEffect(() => {
        fetchReviews();
    }, []);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page

        // Немедленно вызываем API с новыми параметрами
        setTimeout(() => {
            fetchReviews({ page: 1, ...updatedFilters });
        }, 0);
    }, [filters, fetchReviews]);

    // Change page
    const changePage = useCallback((newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));

        // Немедленно вызываем API с новой страницей
        setTimeout(() => {
            fetchReviews({ page: newPage });
        }, 0);
    }, [fetchReviews]);

    // Change limit
    const changeLimit = useCallback((newLimit) => {
        console.log('Changing limit to:', newLimit);
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));

        // Немедленно вызываем API с новым лимитом
        setTimeout(() => {
            fetchReviews({ limit: newLimit, page: 1 });
        }, 0);
    }, [fetchReviews]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchReviews();
    }, [fetchReviews]);

    return {
        reviews,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        changePage,
        changeLimit,
        refresh
    };
};

// Hook for analytics data
export const useAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching analytics data...');
            const analyticsData = await reviewsAPI.getAnalytics();

            // Логируем размер данных
            const dataSize = JSON.stringify(analyticsData).length;
            const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);
            console.log(`Analytics data size: ${dataSizeMB}MB`);

            // Проверяем размер данных
            if (dataSize > 50 * 1024 * 1024) { // 50MB limit
                throw new Error(`Данные слишком большие (${dataSizeMB}MB). Попробуйте позже.`);
            }

            console.log('Analytics data loaded successfully:', {
                reviewsCount: analyticsData.reviews?.length || 0,
                predictionsCount: analyticsData.predictions?.length || 0
            });

            setData(analyticsData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        data,
        loading,
        error,
        refresh: fetchAnalytics
    };
};

// Hook for health check
export const useHealthCheck = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkHealth = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const health = await reviewsAPI.healthCheck();
            setStatus(health);
        } catch (err) {
            setError(err.message);
            console.error('Health check failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkHealth();
    }, [checkHealth]);

    return {
        status,
        loading,
        error,
        refresh: checkHealth
    };
};