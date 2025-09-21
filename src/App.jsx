import { Box, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar.jsx";

export default function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box p={6}>
        <Text fontSize="lg" color="gray.700">
          Сервис для отслеживания динамики клиентских настроений и проблем по банковским продуктам.
        </Text>
      </Box>
    </Box>
  );
}
