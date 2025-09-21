// ❌ Удали вот это:
// import { extendTheme } from "@chakra-ui/theme-utils";

// ✅ Должно быть так:
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
  },
  styles: {
    global: {
      body: {
        bg: "#F5F7FA",
        color: "#1A1A1A",
        fontFamily: "system-ui, sans-serif",
      },
    },
  },
});

export default theme;
