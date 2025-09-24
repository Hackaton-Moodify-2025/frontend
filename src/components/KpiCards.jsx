import { SimpleGrid, Box, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

export default function KpiCards({ stats }) {
  return (
    <SimpleGrid columns={[1, 2, 4]} spacing={6} mb={6}>
      {stats.map((s) => (
        <Box
          key={s.label}
          bg="white"
          p={6}
          rounded="lg"
          boxShadow="md"
          borderLeft="6px solid"
          borderColor={s.color || "brand.500"}
        >
          <Stat>
            <StatLabel>{s.label}</StatLabel>
            <StatNumber>{s.value}</StatNumber>
          </Stat>
        </Box>
      ))}
    </SimpleGrid>
  );
}
