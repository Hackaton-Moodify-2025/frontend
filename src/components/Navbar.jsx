import { Box, Flex, Heading, Spacer, Button } from "@chakra-ui/react";

export default function Navbar() {
  return (
    <Box bg="brand.500" px={6} py={4} boxShadow="sm">
      <Flex align="center">
        <Heading size="md" color="white">
          Газпромбанк.Тех
        </Heading>
        <Spacer />
        <Button colorScheme="whiteAlpha" variant="outline" size="sm">
          Войти
        </Button>
      </Flex>
    </Box>
  );
}
