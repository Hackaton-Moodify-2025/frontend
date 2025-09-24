import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";
import ApiPage from "./pages/ApiPage.jsx";
import ReviewsDashboard from "./pages/ReviewsDashboard.jsx";
import DataLensPage from "./pages/DataLensPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import AnalyticsDashboard from "./pages/AnalyticsDashboard.jsx";

export default function App() {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Routes>
          <Route path="/" element={<ReviewsDashboard />} />
          <Route path="/review/:id" element={<ReviewPage />} />
          <Route path="/api" element={<ApiPage />} />
          <Route path="/datalens" element={<DataLensPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </Box>
    </Router>
  );
}
