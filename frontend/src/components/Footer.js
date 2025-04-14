// src/components/Footer.js
import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="gray.800"
      color="white"
      textAlign="center"
      py={4}
      px={2}
      mt={8}
      // Sticky Footer için:
      position="relative"
      width="100%"
    >
      <Text fontSize={{ base: "xs", md: "sm" }}>
        © 2025 Banka Promosyonları. En güncel banka kampanyalarını keşfedin.
        Tüm hakları saklıdır. Akbank, Garanti BBVA, QNB (Türkiye), Yapı Kredi Bankası, Türkiye İş Bankası, Ziraat Bankası kampanyaları,
        banka promosyonları, banka kampanyaları.
      </Text>
    </Box>
  );
};

export default Footer;
