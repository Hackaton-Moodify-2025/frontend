export const mockData = {
    products: [
      {
        id: "credit_card",
        name: "Кредитные карты",
        reviews_count: 1200,
        sentiment: { positive: 600, neutral: 400, negative: 200 },
        trend: [5, 7, 8, 6, 9],
      },
      {
        id: "mortgage",
        name: "Ипотека",
        reviews_count: 800,
        sentiment: { positive: 200, neutral: 300, negative: 300 },
        trend: [2, 3, 4, 6, 7],
      },
      {
        id: "deposits",
        name: "Вклады",
        reviews_count: 500,
        sentiment: { positive: 350, neutral: 100, negative: 50 },
        trend: [3, 4, 5, 4, 6],
      },
    ],
    summary: {
      total_reviews: 2500,
      sentiment: { positive: 1150, neutral: 800, negative: 550 },
    },
  };
  