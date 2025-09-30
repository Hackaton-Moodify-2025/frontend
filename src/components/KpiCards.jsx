import { SimpleGrid, Box, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

export default function KpiCards({ stats }) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={6}>
      {stats.map((s) => (
        <Box
          key={s.label}
          bg="white"
          p={6}
          rounded="xl"
          boxShadow="md"
          border="1px"
          borderColor="gray.100"
          borderLeft="6px solid"
          borderLeftColor={s.color || "brand.500"}
          transition="all 0.2s"
          _hover={{ 
            boxShadow: "lg", 
            transform: "translateY(-2px)" 
          }}
        >
          <Stat>
            <StatLabel color="gray.600" fontWeight="medium">{s.label}</StatLabel>
            <StatNumber 
              color={s.color || "brand.500"} 
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
            >
              {s.value}
            </StatNumber>
          </Stat>
        </Box>
      ))}
    </SimpleGrid>
  );
}
