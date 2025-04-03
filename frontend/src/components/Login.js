import React, { useState } from "react";
import { Box, Button, Input, FormControl, FormLabel, Flex, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import SEO from "./SEO";
import DOMPurify from "dompurify";
import { ReactComponent as ForgetPassword } from "../assets/undraw_forgot-password_odai.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    const API_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      toast({
        title: "Giriş Başarılı",
        description: "Ana sayfaya yönlendiriliyorsunuz.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/"); // Ana sayfaya yönlendir
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.error || "Giriş başarısız.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <SEO
        title={"Banka Promosyonları - Ana Sayfa"}
        description={
          "En güncel banka promosyonlarını keşfedin. Akbank, Garanti BBVA, Yapı Kredi, Türkiye İş Bankası ve daha fazlası..."
        }
        keywords="banka, promosyon, kampanya, Akbank, Garanti, Yapı Kredi, Türkiye İş Bankası"
        url="https://sitenizin-adresi.com/"
      />

      <Flex
        direction="column" // Başlık ve formu üst üste yerleştiriyoruz
        align="center"
        justify="center"
        mt={5}
        px={5}
      >
        {/* Başlık */}
        <Heading
          as="h1"
          borderBottom={"1px dotted #000"}
          size="md"
          mb={10}
          textAlign="center"
        >
          Giriş Yap
        </Heading>

        <Flex
          maxW={"50em"}
          mx={"auto"}
          direction={{ base: "column", md: "row" }} // Küçük ekranlarda sütun, büyük ekranlarda satır
          align="center"
          justify="center"
          gap={2}
        >
          {/* İllüstrasyon */}
          <Box
            flex="1" // İllüstrasyon kısmının ekranın yarısını almasını sağlıyoruz
            display="flex"
            justifyContent="center" // Ortalamak için
            alignItems="center" // Yatayda ortalamak için
            width={{ base: "60%", sm: "60%" }} // Küçük ekranlarda boyutu küçültüyoruz
          >
            <ForgetPassword width="100%" height="auto" />
          </Box>

          {/* Giriş Formu */}
          <Box
            flex="1" // Formun da ekranın yarısını almasını sağlıyoruz
            maxW="md"
            mx="auto"
            mt={5}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
            width={{ base: "90%", sm: "80%" }} // Küçük ekranlarda formun genişliğini küçültüyoruz
          >
            <FormControl id="email" mb={4}>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}
              />
            </FormControl>
            <FormControl id="password" mb={4}>
              <FormLabel>Şifre</FormLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  setPassword(DOMPurify.sanitize(e.target.value))
                }
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleLogin} width="100%">
              Giriş Yap
            </Button>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default Login;
