// src/components/PostGrid.js
import React, { useCallback, useEffect, useState } from "react";
import { SimpleGrid, Box, Spinner, Text, Input, HStack, Button } from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import PostCard from "./PostCard.js";
import DOMPurify from 'dompurify'

const PostGrid = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const limit = 16; // Her sayfada gösterilecek post sayısı

  const fetchPosts = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      // URL'den bank ve category değerlerini alıyoruz
      const banks = searchParams.get("bank") || "";
      const categories = searchParams.get("category") || "";
      const params = {
        bank: banks,
        category: categories,
        limit,
        offset: pageNum * limit,
      };
      if (searchTerm.trim()) {
        params.search = DOMPurify.sanitize(searchTerm.trim());
      }

      const { data } = await axios.get(`${API_URL}/posts`, { params });

         // 💥 Güvenli kontrol
      if (!Array.isArray(data)) {
        console.error("Beklenmeyen veri formatı:", data);
        setPosts([]);
        setHasMore(false);
        return;
      }
      
      if (pageNum === 0) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }
      setHasMore(data.length >= limit);
    } catch (error) {
      console.error("Postlar alınırken hata:", error);
    }
    setLoading(false);
  }, [API_URL, searchParams, searchTerm, limit]);

  useEffect(() => {
    setPage(0);
    fetchPosts(0);
  }, [fetchPosts]);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleFilter = () => {
    // Arama terimini URL parametresine ekleyebilirsiniz
    const newParams = {};
    if (searchTerm.trim()) newParams.search = DOMPurify.sanitize(searchTerm.trim());
    // Burada banka ve kategori filtreleri de ekleniyorsa newParams.bank, newParams.category eklenebilir
    setSearchParams(newParams);
    fetchPosts(0);
  };

  return (
    <Box>
      <HStack mb={4}>
        <Input
          placeholder="Arama..."
          value={searchTerm}
          name="searchTerm"
          onChange={(e) => setSearchTerm(DOMPurify.sanitize(e.target.value))}
        />
        <Button colorScheme="blue" onClick={handleFilter}>
          Filtrele
        </Button>
      </HStack>
      {loading && page === 0 ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : posts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text>Hiç post bulunamadı.</Text>
        </Box>
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          }
          endMessage={
            <Box textAlign="center" py={10}>
              <Text>Son postlara ulaşıldı.</Text>
            </Box>
          }
        >
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={4}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </SimpleGrid>
        </InfiniteScroll>
      )}
    </Box>
  );
};

export default PostGrid;
