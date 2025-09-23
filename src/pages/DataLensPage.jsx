import { Box, Text } from "@chakra-ui/react";

export default function DataLensPage() {
  return (
    <Box p={6}>
      <Text fontSize="lg" color="gray.700" mb={4}>
        Встроенный Yandex DataLens дашборд
      </Text>

        {/* Тестовая страница с проверкой работоспособности :) */}
    
      <Box w="100%" h="800px" borderRadius="lg" overflow="hidden" boxShadow="md">
        <iframe
          src="https://datalens.yandex/lpp22wtwz5l06"
          style={{ border: "none", width: "100%", height: "100%" }}
          allowFullScreen
          title="DataLens Dashboard"
        />
      </Box>
    </Box>
  );
}
