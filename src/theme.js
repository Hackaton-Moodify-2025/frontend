import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f0fa",
      100: "#b3d0eb",
      200: "#80afe0",
      300: "#4d8fd4",
      400: "#1a6ec8",
      500: "#004B87", // основной синий
      600: "#003a6b",
      700: "#00294f",
      800: "#001933",
      900: "#000a18",
    },
    positive: "#27AE60",
    neutral: "#95A5A6",
    negative: "#C0392B",
    warning: "#F39C12",
    // Дополнительные цвета для аналитики
    success: {
      50: "#e8f5e8",
      500: "#27AE60",
      600: "#219a52",
    },
    error: {
      50: "#fde8e8",
      500: "#C0392B",
      600: "#a02622",
    },
    info: {
      50: "#e6f0fa",
      500: "#004B87",
      600: "#003a6b",
    }
  },
  fonts: {
    heading: "system-ui, -apple-system, sans-serif",
    body: "system-ui, -apple-system, sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? "gray.900" : "#F8FAFC",
        color: props.colorMode === 'dark' ? "white" : "#1A1A1A",
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
    }),
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          shadow: "lg",
          borderRadius: "xl",
          border: "1px",
          borderColor: "gray.200",
        }
      }
    },
    Button: {
      defaultProps: {
        colorScheme: "brand"
      },
      variants: {
        solid: {
          borderRadius: "lg",
          fontWeight: "semibold"
        },
        outline: {
          borderRadius: "lg",
          fontWeight: "semibold"
        }
      }
    },
    Badge: {
      variants: {
        solid: {
          borderRadius: "full",
          textTransform: "none"
        },
        subtle: {
          borderRadius: "full",
          textTransform: "none"
        }
      }
    }
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  }
});

export default theme;
