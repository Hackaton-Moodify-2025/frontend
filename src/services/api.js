const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

class ReviewsAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.defaultTimeout = 10000;
    }

    async request(endpoint, { method = 'GET', params = {}, body = null, timeout = this.defaultTimeout } = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const query = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value != null && value !== '') query.append(key, value);
            });

            const url = query.toString()
                ? `${this.baseURL}${endpoint}?${query}`
                : `${this.baseURL}${endpoint}`;

            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            };

            if (body) options.body = JSON.stringify(body);

            const response = await fetch(url, options);

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`API error ${response.status}: ${text || response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`Request to ${endpoint} timed out after ${timeout}ms`);
            }
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    getReviews({ page = 1, limit = 20, topic = '', sentiment = '', dateFrom = '', dateTo = '' } = {}) {
        return this.request('/reviews', {
            params: {
                page,
                limit,
                topic,
                sentiment,
                date_from: dateFrom,
                date_to: dateTo
            }
        });
    }

    getAnalytics({ topic = '', sentiment = '', dateFrom = '', dateTo = '' } = {}) {
        return this.request('/analytics', {
            params: {
                topic,
                sentiment,
                date_from: dateFrom,
                date_to: dateTo
            }
        });
    }

    getReviewById(id) {
        return this.request(`/reviews/${id}`);
    }

    healthCheck() {
        const base = this.baseURL.replace(/\/api\/v1$/, '');
        return this.request(`${base}/health`, {});
    }
}

const reviewsAPI = new ReviewsAPI(API_BASE_URL);

export default reviewsAPI;
