import { Box, SimpleGrid, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

export default function DashboardPage() {
  // Мокушки
  const stats = [
    { label: "Всего отзывов", value: 2500 },
    { label: "Позитивные", value: 1150, color: "positive" },
    { label: "Нейтральные", value: 800, color: "neutral" },
    { label: "Негативные", value: 550, color: "negative" },
  ];

  return (
    <Box p={6}>
      <SimpleGrid columns={[1, 2, 4]} spacing={6}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            bg="white"
            p={6}
            rounded="lg"
            boxShadow="md"
            borderLeft="6px solid"
            borderColor={stat.color ? stat.color : "brand.500"}
          >
            <Stat>
              <StatLabel>{stat.label}</StatLabel>
              <StatNumber>{stat.value}</StatNumber>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
