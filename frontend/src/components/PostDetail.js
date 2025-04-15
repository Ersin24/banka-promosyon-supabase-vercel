// components/PostDetail.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Spinner,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  useToast,
  Flex,
  AspectRatio,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaThumbsUp, FaArrowRight } from "react-icons/fa";
import DOMPurify from "dompurify";
import SEO from "./SEO";

// Basit token decode işlemi için (jwt-decode kütüphanesini de kullanabilirsiniz)
const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId; // Token payload'ınız { userId, isAdmin, ... } şeklinde ise
  } catch (err) {
    return null;
  }
};

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const toast = useToast();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postRes = await axios.get(`${API_URL}/posts/${id}`);
        setPost(postRes.data);
      } catch (error) {
        // console.error("Post detayları alınırken hata:", error);
        toast({
          title: "Hata",
          description: "Post detayları alınırken bir hata oluştu.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        // GET sorgusunda, ilişkisel olarak usernames ve comment_likes verilerini da alıyoruz
        const commentsRes = await axios.get(`${API_URL}/comments?post_id=${id}`, config);
        setComments(commentsRes.data);
      } catch (error) {
        // console.error("Yorumlar alınırken hata:", error);
        toast({
          title: "Hata",
          description: "Yorumlar alınırken bir hata oluştu.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchData = async () => {
      await fetchPostDetails();
      await fetchComments();
      setLoading(false);
    };

    fetchData();
  }, [id, API_URL, toast]);

  const handleAddComment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Uyarı",
        description: "Lütfen giriş yapınız.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!commentContent.trim()) {
      toast({
        title: "Uyarı",
        description: "Yorum boş olamaz.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(
        `${API_URL}/comments`,
        { post_id: id, content: commentContent },
        config
      );
      setComments([res.data, ...comments]);
      setCommentContent("");
      toast({
        title: "Başarılı",
        description: "Yorum başarıyla eklendi.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // console.error("Yorum eklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Uyarı",
        description: "Lütfen giriş yapınız.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const index = comments.findIndex((c) => c.id === commentId);
    if (index === -1) return;
    const comment = comments[index];
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Mevcut kullanıcının beğenip beğenmediğini kontrol edelim:
    const liked = comment.comment_likes
      ? comment.comment_likes.some((like) => like.user_id === currentUserId)
      : false;

    if (!liked) {
      try {
        await axios.post(`${API_URL}/comment-likes`, { comment_id: commentId }, config);
        // Yerel state güncellemesi: yeni beğeni ekleniyor
        const updatedComment = {
          ...comment,
          comment_likes: comment.comment_likes ? [...comment.comment_likes, { user_id: currentUserId }] : [{ user_id: currentUserId }],
        };
        const newComments = [...comments];
        newComments[index] = updatedComment;
        setComments(newComments);
        toast({
          title: "Başarılı",
          description: "Beğeni eklendi.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        // console.error("Beğeni eklenirken hata:", error);
        toast({
          title: "Hata",
          description: "Beğeni eklenirken bir hata oluştu.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      try {
        await axios.delete(`${API_URL}/comment-likes`, {
          params: { comment_id: commentId },
          headers: { Authorization: `Bearer ${token}` },
        });
        // Yerel state güncellemesi: beğeni kaldırılıyor
        const updatedComment = {
          ...comment,
          comment_likes: comment.comment_likes.filter((like) => like.user_id !== currentUserId),
        };
        const newComments = [...comments];
        newComments[index] = updatedComment;
        setComments(newComments);
        toast({
          title: "Başarılı",
          description: "Beğeni kaldırıldı.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        // console.error("Beğeni kaldırılırken hata:", error);
        toast({
          title: "Hata",
          description: "Beğeni kaldırılırken bir hata oluştu.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 🔒 Günlük hesaplama için saat sıfırlama
  
  const postEndDate = post ? new Date(post.end_date) : today;
  postEndDate.setHours(0, 0, 0, 0); // 🔒 Aynı şekilde bitiş tarihini de sıfırla
  
  const timeDiff = postEndDate - today;
  const remainingDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  const isExpired = remainingDays < 0;

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!post) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Post bulunamadı.</Text>
      </Box>
    );
  }

  // İçeriği satır sonlarına göre bölüyoruz.
  const sentences = post.content.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim() !== "");

  // SEO için dinamik içerik ayarlaması
  const seoTitle = `${post.bank_name} - ${post.title} | Banka Promosyonları`;
  const seoDescription = post.content.slice(0, 160);
  const seoKeywords = `${post.bank_name}, ${post.category}, banka kampanyası, promosyonlar`;
  const seoUrl = `https://sitenizin-adresi.com/kampanyalar/${id}`;

  return (
    <Box maxW={{ base: "100%", md: "70%" }} mx="auto" p={1}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={seoUrl}
        image={post.image_url}
      />

      <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
        <Box w={{ base: "100%", md: "50%" }}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {post.title}
          </Text>
        </Box>
        <Box w={{ base: "100%", md: "50%" }}>
          <AspectRatio ratio={16/9}>
            <Image
              loading="lazy"
              src={post.image_url}
              alt={post.title}
              objectFit="cover"
              borderRadius="md"
              onError={(e) => {
                if (e.target.src !== "/image-placeholder.svg") {
                  e.target.onerror = null;
                  e.target.src = "/image-placeholder.svg";
                }
              }}
            />
          </AspectRatio>
        </Box>
      </Flex>

      <Box mt={4}>
        <List spacing={2}>
          {sentences.map((sentence, idx) => (
            <ListItem key={idx} fontFamily={"serif"}>
              <ListIcon as={FaArrowRight} color={"green.500"} /> {sentence}
            </ListItem>
          ))}
        </List>
        <Flex justifyContent="space-between" flexWrap="wrap">
          <Text fontWeight="bold">Banka: {post.bank_name}</Text>
          <Text fontWeight="bold">Kategori: {post.category}</Text>
        </Flex>
        <Text mt={2}>
          {isExpired
            ? "Süresi Doldu"
            : remainingDays <= 3
            ? remainingDays === 0
              ? "Son Gün!"
              : remainingDays === 1
              ? "Son 1 Gün!"
              : `Son ${remainingDays} Gün!`
            : `${remainingDays} gün kaldı`}
        </Text>
      </Box>

      <Box mt={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Yorumlar
        </Text>
        <FormControl id="comment" mb={4}>
          <FormLabel>Yorumunuzu Yazınız</FormLabel>
          <Input
            placeholder="Yorum..."
            value={commentContent}
            onChange={(e) => setCommentContent(DOMPurify.sanitize(e.target.value))}
            autoComplete="off"
          />
        </FormControl>
        <Button colorScheme="blue" onClick={handleAddComment} mb={8}>
          Yorum Gönder
        </Button>
        {comments.length === 0 ? (
          <Text>Henüz yorum yapılmamış.</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {comments.map((comment) => {
              // Hesaplama: beğeni sayısını ve mevcut kullanıcının beğenip beğenmediğini belirleyelim
              const likeCount = comment.comment_likes ? comment.comment_likes.length : 0;
              const liked = comment.comment_likes
                ? comment.comment_likes.some(like => like.user_id === currentUserId)
                : false;

              return (
                <Box key={comment.id} p={4} borderWidth="1px" borderRadius="md">
                  <HStack justifyContent="space-between">
                    <Text fontWeight="bold" fontSize={"xs"}>
                      @{comment.usernames?.username || "Anonim"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>
                  </HStack>
                  <Text fontFamily={"serif"} fontSize={"1.1em"} mt={2}>
                    {comment.content}
                  </Text>
                  <HStack
                    mt={2}
                    spacing={1}
                    cursor="pointer"
                    onClick={() => handleToggleLike(comment.id)}
                  >
                    <FaThumbsUp color={liked ? "blue" : "gray"} />
                    <Text>{likeCount}</Text>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PostDetail;
