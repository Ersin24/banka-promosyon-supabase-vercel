import React from "react";
import { Box, Image, Text, Badge, AspectRatio, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";

const PostCard = ({ post }) => {
  const today = new Date();
  const endDate = new Date(post.end_date);
  const timeDiff = endDate - today;
  const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const isExpired = remainingDays < 0;

  let badgeText = "";
  if (isExpired) {
    badgeText = "Süresi Doldu";
  } else if (remainingDays <= 3) {
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
      <Box
        position="relative"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        maxW={{base: "260px", sm: "300px", md: "full"}}
        mx={{base: "auto", md: "0"}}
      >
        {post.image_url ? (
          <AspectRatio ratio={16 / 9} width="100%">
            <Image
              loading="lazy"
              src={post.image_url}
              alt={post.title}
              objectFit="cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/yer-tutucu.png";
              }}
            />
          </AspectRatio>
        ) : (
          <Text p={4} color="gray.500" fontSize={{ base: "sm", md: "md"}}>
            Resim bulunamadı
          </Text>
        )}
        <Badge
          position="absolute"
          top={{base: "8px", md:"10px"}}
          right={{base: "8px", md:"10px"}}
          colorScheme={isExpired ? "red" : "green"}
          fontSize={{base: "xs", md:"sm"}}
        >
          {badgeText}
        </Badge>
        <Box p={{base: 3, md:4}}>
          <Text noOfLines={2} fontWeight="bold" fontSize={{base: "md", md:"lg"}}>
            {post.title}
          </Text>
          <HStack mt={2} spacing={{base: 1, md:2}} align="center">
            {post.bank_name && (
              <>
                <FontAwesomeIcon icon={faBuildingColumns} fontSize={".9em"} />
                <Text fontSize={{base: "xs", md:"xs"}}>{post.bank_name}</Text>
              </>
            )}
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};

export default PostCard;
