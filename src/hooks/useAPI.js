import { useState, useEffect, useCallback } from 'react';
import reviewsAPI from '../services/api';

const formatError = (err, fallbackMessage = 'Unexpected error') => {
    if (!err) return { message: fallbackMessage, status: null };

    if (err.response) {
        return {
            message: err.response.message || fallbackMessage,
            status: err.response.status || null
        };
    }

    return {
        message: err.message || fallbackMessage,
        status: err.status || null
    };
};

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

    const fetchReviews = useCallback(
        async (customParams = {}) => {
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
                const formatted = formatError(err, 'Failed to fetch reviews');
                setError(formatted);
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        },
        [pagination.page, pagination.limit, filters]
    );

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const updateFilters = (newFilters) => {
        setFilters(prev => {
            const updatedFilters = { ...prev, ...newFilters };
            fetchReviews({ page: 1, ...updatedFilters });
            return updatedFilters;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const changePage = useCallback(
        (newPage) => {
            setPagination(prev => ({ ...prev, page: newPage }));
            fetchReviews({ page: newPage });
        },
        [fetchReviews]
    );

    const changeLimit = useCallback(
        (newLimit) => {
            console.log('Changing limit to:', newLimit);
            setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
            fetchReviews({ limit: newLimit, page: 1 });
        },
        [fetchReviews]
    );

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

export const useAnalytics = (filters = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(
        async (customFilters = {}) => {
            setLoading(true);
            setError(null);

            try {
                const requestFilters = { ...filters, ...customFilters };
                console.log('Fetching analytics data with filters:', requestFilters);

                const analyticsData = await reviewsAPI.getAnalytics(requestFilters);

                const dataSize = JSON.stringify(analyticsData).length;
                const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);
                console.log(`Analytics data size: ${dataSizeMB}MB`);

                console.log('Analytics data loaded successfully:', {
                    reviewsCount: analyticsData.reviews?.length || 0,
                    predictionsCount: analyticsData.predictions?.length || 0
                });

                setData(analyticsData);
            } catch (err) {
                const formatted = formatError(err, 'Failed to fetch analytics');
                setError(formatted);
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

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
            const formatted = formatError(err, 'Health check failed');
            setError(formatted);
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