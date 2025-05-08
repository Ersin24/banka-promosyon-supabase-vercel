// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Roboto', sans-serif`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  colors: {
    gradient: {
      a1: "linear-gradient(to right, #a6c0fe, #f68084)",
    },
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3", // Ana aksan rengi
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
  },
  styles: {
    global: {
      "html, body": {
        fontWeight: 'normal',
        fontSize: '16px',
        bg: "gray.50",
        color: "gray.800",
        lineHeight: "base",
      },
      a: {
        _hover: {
          textDecoration: "underline",
        },
      },
      img: {
        display: "block",
        maxWidth: "100%",
        height: "auto",
      },
      "h1,h2,h3,h4,h5,h6" :{
        lineHeight:"short",
      }
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'normal',
      },
      sizes: {
        xl: {
          fontSize: '4xl',
        },
        lg: {
          fontSize: '3xl',
        },
        md: {
          fontSize: '2xl',
        },
        sm: {
          fontSize: 'xl',
        },
      }
    }
  }
});

export default theme;
