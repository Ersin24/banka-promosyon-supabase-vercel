// src/components/NotFound.js
import React from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

const NotFound = () => {
  return (
    <>
      <SEO
        title="404 - Sayfa Bulunamadı"
        description="Üzgünüz, aradığınız sayfa bulunamadı."
        keywords="404, sayfa bulunamadı"
        url={window.location.href}
      />
      <VStack spacing={4} align="center" justify="center" minH="70vh">
        <Heading fontSize="5xl" color="red.400">
          404
        </Heading>
        <Text fontSize="xl">Aradığınız sayfa bulunamadı!</Text>
        <Box>
          <Button as={Link} to="/" colorScheme="blue">
            Ana Sayfaya Dön
          </Button>
        </Box>
      </VStack>
    </>
  );
};

export default NotFound;
