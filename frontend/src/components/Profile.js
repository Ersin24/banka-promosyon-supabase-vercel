// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { Box, Text, Spinner, Button, VStack } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth.js';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid()) {
        localStorage.removeItem("token")
        navigate('/giris-yap');
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/auth/me`, config);
        setUser(res.data);
      } catch (error) {
        console.error("Profil bilgisi alınırken hata:", error);
        localStorage.removeItem("token");
        navigate("/giris-yap")
      }
      setLoading(false);
    };

    fetchProfile();
  }, [API_URL, navigate]);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Profil bilgisi alınamadı.</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Profil
      </Text>
      <VStack align="start" spacing={2}>
        <Text>Email: {user.email}</Text>
        <Text>Kullanıcı Adı: {user.username || "Belirtilmemiş"}</Text>
      </VStack>
      <Button mt={4} colorScheme="blue" onClick={() => navigate("/")}>
        Ana Sayfaya Dön
      </Button>
    </Box>
  );
};

export default Profile;
