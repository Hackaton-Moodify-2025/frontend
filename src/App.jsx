import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Container } from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";
import ReviewsDashboard from "./pages/ReviewsDashboard.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import AnalyticsDashboard from "./pages/AnalyticsDashboard.jsx";
import MLPredictionPage from "./pages/MLPredictionPage.jsx";

export default function App() {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Container
          maxW={{ base: "100%", sm: "95%", md: "90%", lg: "1400px", xl: "1600px" }}
          px={{ base: 4, md: 6, lg: 8 }}
          mx="auto"
        >
          <Routes>
            <Route path="/" element={<ReviewsDashboard />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/ml-prediction" element={<MLPredictionPage />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}
