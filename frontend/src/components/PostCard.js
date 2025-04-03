// src/components/PostCard.js
import React from 'react';
import { Box, Image, Text, Badge, AspectRatio } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const today = new Date();
  const endDate = new Date(post.end_date);
  // Zaman farkını hesaplıyoruz (ms cinsinden)
  const timeDiff = endDate - today;
  // Kalan gün sayısını hesaplıyoruz: Eğer fark 0 ise 0, pozitifse Math.ceil
  const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isExpired = remainingDays < 0;
  
  let badgeText = "";
  if (isExpired) {
    badgeText = "Süresi Doldu";
  } else if (remainingDays <= 3) {
    // Eğer kalan gün 0 veya 1 ise "Son Gün!", 2 ise "Son 2 Gün!", 3 ise "Son 3 Gün!" şeklinde göster.
    if (remainingDays === 0 || remainingDays === 1) {
      badgeText = "Son Gün!";
    } else if (remainingDays === 2) {
      badgeText = "Son 2 Gün!";
    } else if (remainingDays === 3) {
      badgeText = "Son 3 Gün!";
    }
  } else {
    badgeText = `${remainingDays} gün kaldı`;
  }
  
  return (
    <Link to={`/kampanyalar/${post.id}`}>
      <Box position="relative" borderWidth="1px" borderRadius="lg" overflow="hidden" cursor="pointer">
        {post.image_url ? (
          <AspectRatio ratio={16/9} width={"100%"}>
            <Image
              loading='lazy'
              src={post.image_url}
              alt={post.title}
              objectFit="cover"
              onError={(e) => {
                // Eğer placeholder'a zaten geçiş yapıldıysa tekrar değiştirmeyelim
                if (e.target.src !== "https://placehold.co/300x200?text=Resim+Bulunamad%C4%B1") {
                  // onError tetiklenmesinin tekrar çalışmasını engelle
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200?text=Resim+Bulunamad%C4%B1";
                }
              }}
            />
          </AspectRatio>
        ) : (
          <Text p={4} color="gray.500">Resim bulunamadı</Text>
        )}
        <Badge
          position="absolute"
          top="10px"
          right="10px"
          colorScheme={isExpired ? "red" : "green"}
          fontSize="sm"
        >
          {badgeText}
        </Badge>
        <Box p="4">
          <Text fontWeight="bold" fontSize="lg">
            {post.title}
          </Text>
        </Box>
      </Box>
    </Link>
  );
};

export default PostCard;
