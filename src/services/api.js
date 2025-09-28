// API configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// API service for reviews
class ReviewsAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get paginated reviews with optional filters
    async getReviews({ page = 1, limit = 20, topic = '', sentiment = '', dateFrom = '', dateTo = '' } = {}) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (topic) params.append('topic', topic);
        if (sentiment) params.append('sentiment', sentiment);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const response = await fetch(`${this.baseURL}/reviews?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Get all analytics data
    async getAnalytics({ topic = '', sentiment = '', dateFrom = '', dateTo = '' } = {}) {
        const params = new URLSearchParams();

        if (topic) params.append('topic', topic);
        if (sentiment) params.append('sentiment', sentiment);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const url = params.toString() ? `${this.baseURL}/analytics?${params}` : `${this.baseURL}/analytics`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Health check
    async healthCheck() {
        const response = await fetch('http://localhost:8080/health');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

// Create singleton instance
const reviewsAPI = new ReviewsAPI();

export default reviewsAPI;