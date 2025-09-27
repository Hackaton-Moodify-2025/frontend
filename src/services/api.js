// API configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// API service for reviews
class ReviewsAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get paginated reviews with optional filters
    async getReviews({ page = 1, limit = 20, topic = '', sentiment = '' } = {}) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (topic) params.append('topic', topic);
        if (sentiment) params.append('sentiment', sentiment);

        const response = await fetch(`${this.baseURL}/reviews?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Get all analytics data
    async getAnalytics() {
        const response = await fetch(`${this.baseURL}/analytics`);

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