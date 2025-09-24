import { Box, Flex, Heading, Spacer, HStack, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const navItems = [
    { label: "Отзывы", to: "/" },
    { label: "Аналитика", to: "/analytics" },
    { label: "API", to: "/api" },
    { label: "DataLens", to: "/datalens" },
  ];

  return (
    <Box bg="brand.500" px={8} py={4} boxShadow="md" position="sticky" top={0} zIndex={10}>
      <Flex align="center">
        <Heading size="md" color="white">
          Газпромбанк.Тех
        </Heading>
        <Spacer />
        <HStack spacing={2}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              as={NavLink}
              to={item.to}
              variant="ghost"
              color="white"
              fontWeight="medium"
              _hover={{ bg: "whiteAlpha.200" }}
              _activeLink={{
                bg: "white",
                color: "brand.500",
                fontWeight: "bold",
              }}
              size="sm"
              borderRadius="md"
              transition="all 0.2s"
            >
              {item.label}
            </Button>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
}
