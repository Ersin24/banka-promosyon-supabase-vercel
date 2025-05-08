// src/components/AdminPanel.js
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import ReactSelect from "react-select";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify'
import { bankOptions, categoryOptions } from "../utils/constatns.js";

const AdminPanel = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bankName, setBankName] = useState(null);
  const [category, setCategory] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const handleSubmit = async () => {
    if (!title || !content || !startDate || !endDate) {
      toast({
        title: "Hata",
        description: "Başlık, açıklama, başlangıç ve bitiş tarihi zorunludur.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      toast({
        title: "Tarih Hatası",
        description: "Başlangıç tarihi bitiş tarihinden sonra olamaz.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${API_URL}/posts`,
        {
          title,
          content,
          image_url: imageUrl,
          bank_name: bankName ? bankName.value : "",
          category: category ? category.value : "",
          start_date: startDate,
          end_date: endDate,
        },
        config
      );
      toast({
        title: "Başarılı",
        description: "Post başarıyla eklendi!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTitle("");
      setContent("");
      setImageUrl("");
      setBankName(null);
      setCategory(null);
      setStartDate("");
      setEndDate("");
      navigate("/");
    } catch (err) {
      // console.error(err);
      toast({
        title: "Hata",
        description:
          err.response?.data?.error || "Post eklenirken hata oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} p={5} borderWidth="1px" borderRadius="lg">
      <Text fontSize="2xl" mb={4} fontWeight="bold">
        Yeni Post Paylaş
      </Text>
      <FormControl id="title" mb={4} isRequired>
        <FormLabel>Başlık</FormLabel>
        <Input
          type="text"
          name="title"
          value={title}
          onChange={(e) => {
            const raw = DOMPurify.sanitize(e.target.value);
            const formatted = raw.charAt(0).toLocaleUpperCase("tr-TR")+ raw.slice(1).toLocaleLowerCase("tr-TR");
            setTitle(formatted);  
          }}
          placeholder="Post başlığını girin"
        />
      </FormControl>
      <FormControl id="content" mb={4} isRequired>
        <FormLabel>Açıklama</FormLabel>
        <Textarea
          type="text"
          name="content"
          value={content}
          onChange={(e) => setContent(DOMPurify.sanitize(e.target.value))}
          placeholder="Post açıklamasını girin"
        />
      </FormControl>
      <FormControl id="imageUrl" mb={4}>
        <FormLabel>Resim URL</FormLabel>
        <Input
          type="text"
          name="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(DOMPurify.sanitize(e.target.value))}
          placeholder="Resim URL'sini girin"
        />
      </FormControl>
      <FormControl id="bankName" mb={4}>
        <FormLabel>Banka Adı</FormLabel>
        <ReactSelect
          options={bankOptions}
          name="bankName"
          placeholder="Banka seçin"
          value={bankName}
          onChange={setBankName}
        />
      </FormControl>
      <FormControl id="category" mb={4}>
        <FormLabel>Kategori</FormLabel>
        <ReactSelect
          options={categoryOptions}
          name="categoryOptions"
          placeholder="Kategori seçin"
          value={category}
          onChange={setCategory}
        />
      </FormControl>
      <FormControl id="startDate" mb={4} isRequired>
        <FormLabel>Başlangıç Tarihi</FormLabel>
        <Input
          type="date"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(DOMPurify.sanitize(e.target.value))}
        />
      </FormControl>
      <FormControl id="endDate" mb={4} isRequired>
        <FormLabel>Bitiş Tarihi</FormLabel>
        <Input
          type="date"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(DOMPurify.sanitize(e.target.value))}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        onClick={handleSubmit}
        isLoading={loading}
        width="100%"
      >
        Post Gönder
      </Button>
    </Box>
  );
};

export default AdminPanel;
