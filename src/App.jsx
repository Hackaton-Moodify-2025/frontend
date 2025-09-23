import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";
import ApiPage from "./pages/ApiPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DataLensPage from "./pages/DataLensPage.jsx";

export default function App() {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/api" element={<ApiPage />} />
          <Route path="/datalens" element={<DataLensPage />} />
        </Routes>
      </Box>
    </Router>
  );
}
