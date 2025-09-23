import { Box, Flex, Heading, Spacer, Button, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <Box bg="brand.500" px={6} py={4} boxShadow="sm">
      <Flex align="center">
        <Heading size="md" color="white">
          Газпромбанк.Тех
        </Heading>
        <Spacer />
        <HStack spacing={4}>
          <Button as={Link} to="/" variant="ghost" color="white">
            Дашборд
          </Button>
          <Button as={Link} to="/api" variant="ghost" color="white">
            API
          </Button>
          <Button as={Link} to="/datalens" variant="ghost" color="white">
            DataLens
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
