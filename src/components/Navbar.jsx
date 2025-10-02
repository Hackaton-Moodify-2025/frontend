import {
  Box,
  Flex,
  Heading,
  Spacer,
  HStack,
  Button,
  Container,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiBarChart2, FiMessageSquare, FiCode, FiTrendingUp, FiCpu } from "react-icons/fi";

export default function Navbar() {
  const bgGradient = useColorModeValue(
    "linear(to-r, brand.500, brand.600)",
    "linear(to-r, brand.600, brand.700)"
  );

  const navItems = [
    {
      label: "Отзывы",
      to: "/",
      icon: FiMessageSquare,
      description: "Просмотр отзывов клиентов"
    },
    {
      label: "Аналитика",
      to: "/analytics",
      icon: FiBarChart2,
      description: "Продвинутая аналитика с фильтрами"
    },
    {
      label: "ML Предсказания",
      to: "/ml-prediction",
      icon: FiCpu,
      description: "ML-модель для анализа тем и тональности",
      isNew: true
    },
  ];

  return (
    <Box
      bgGradient={bgGradient}
      py={4}
      boxShadow="xl"
      position="sticky"
      top={0}
      zIndex={100}
      backdropFilter="blur(10px)"
    >
      <Container
        maxW={{ base: "100%", sm: "95%", md: "90%", lg: "1400px", xl: "1600px" }}
        px={{ base: 4, md: 6, lg: 8 }}
      >
        <Flex align="center">
          <HStack as={NavLink} to="/" spacing={2}>
            <Icon as={FiTrendingUp} color="white" boxSize={6} />
            <Heading size="md" color="white" fontWeight="bold">
              Газпромбанк.Аналитика
            </Heading>
          </HStack>
          <Spacer />
          <HStack spacing={1}>
            {navItems.map((item) => (
              <Tooltip
                key={item.to}
                label={item.description}
                placement="bottom"
                hasArrow
              >
                <Button
                  as={NavLink}
                  to={item.to}
                  variant="ghost"
                  color="white"
                  fontWeight="medium"
                  leftIcon={<Icon as={item.icon} />}
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-1px)",
                    shadow: "lg"
                  }}
                  _activeLink={{
                    bg: "white",
                    color: "brand.500",
                    fontWeight: "bold",
                    shadow: "md"
                  }}
                  size="sm"
                  borderRadius="lg"
                  transition="all 0.2s"
                  position="relative"
                >
                  {item.label}
                  {item.isNew && (
                    <Badge
                      colorScheme="yellow"
                      variant="solid"
                      fontSize="xs"
                      position="absolute"
                      top="-1"
                      right="-1"
                      borderRadius="full"
                      transform="scale(0.8)"
                    >
                      NEW
                    </Badge>
                  )}
                </Button>
              </Tooltip>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
