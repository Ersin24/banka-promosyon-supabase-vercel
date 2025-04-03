import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SEO from "./SEO";
import DOMPurify from "dompurify";
import { ReactComponent as HeartRegister } from "../assets/undraw_with-love_rs1k.svg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        username,
      });
      toast({
        title: "Kayıt Başarılı",
        description: "Lütfen giriş yapınız.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/giris-yap");
    } catch (err) {
      toast({
        title: "Hata",
        description: err.response?.data?.error || "Kayıt başarısız.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <>
     <SEO
        title={"Banka Promosyonları - Kayıt Ol"}
        description={"Yeni hesap oluşturarak banka promosyonlarını keşfedin."}
        keywords="kayıt, hesap oluştur, banka promosyonu"
        url="https://sitenizin-adresi.com/kayit-ol"
      />
      <Flex
        direction="column" // Başlık ve formu üst üste yerleştiriyoruz
        align="center"
        justify="center"
        mt={5}
        px={5}
      >
        {/* Başlık */}
        <Heading as="h1" borderBottom={"1px dotted #000"} size="md" mb={10} textAlign="center">
          Kayıt Ol
        </Heading>

        <Flex
          maxW={"50em"}
          mx={"auto"}
          direction={{ base: "row", md: "row" }} // Küçük ekranlarda sütun, büyük ekranlarda satır
          align="center"
          justify="center"
          gap={5}
        >
          {/* İllüstrasyon */}
          <Box
            flex="1" // İllüstrasyon kısmının ekranın yarısını almasını sağlıyoruz
            display="flex"
            justifyContent="center" // Ortalamak için
          >
            <HeartRegister width="100%" height="auto" />
          </Box>

          {/* Kayıt Formu */}
          <Box
            flex="1" // Formun da ekranın yarısını almasını sağlıyoruz
            maxW="md"
            mx="auto"
            mt={5}
            p={5}
            borderWidth="1px"
            borderRadius="lg"
          >
            <FormControl id="email" mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(DOMPurify.sanitize(e.target.value))}
              />
            </FormControl>
            <FormControl id="password" mb={4} isRequired>
              <FormLabel>Şifre</FormLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))}
              />
            </FormControl>
            <FormControl id="username" mb={4} isRequired>
              <FormLabel>Benzersiz Kullanıcı Adı (@username)</FormLabel>
              <Input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(DOMPurify.sanitize(e.target.value))}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              onClick={handleRegister}
              isLoading={loading}
              width="100%"
            >
              Kayıt Ol
            </Button>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default Register;
