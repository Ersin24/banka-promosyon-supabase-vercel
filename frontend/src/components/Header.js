//components/Header.js
import React, { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaUserCircle, FaFilter } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isTokenValid, isAdminUser } from "../utils/auth.js";

const Header = ({ onOpenFilter }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Fonksiyon: token değişikliklerini kontrol etmek için
  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (token && isTokenValid()) {
      setIsLoggedIn(true);
      setIsAdmin(isAdminUser());
    } else {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  // Başlangıçta token'ı kontrol et
  useEffect(() => {
    checkToken();

    // localStorage'daki token değişikliklerini dinlemek için bir custom event veya interval kullanılabilir.
    // Basit bir örnek: her 5 saniyede bir token'ı kontrol et.
    const interval = setInterval(() => {
      checkToken();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/giris-yap");
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      wrap="nowrap"
      padding=".9rem"
      bg={"white"}
      color="black"
      borderBottom={"1px solid black"}
    >
      {/* Sol: Uygulama Logosu */}
      <Box flex="1">
        <Link
          to="/"
          style={{ textDecoration: "none" }}
          _hover={{ textDecoration: "none" }}
        >
           {/* family=Poppins:wght@400;500;600;700&
    family=Roboto:wght@400;500;600;700&
    family=Inter:wght@400;500;600;700&
    family=Nunito+Sans:wght@400;500;600;700&
    display=swap" */}
          <Box
            fontFamily="'Inter', sans-serif"
            fontWeight="semibold"
            fontSize={{ base: "18px", md: "24px" }}
          >
            <Text as="span" color="#374151">
              Kampanya
            </Text>
            <Text as="span" color="#10B981">
              360
            </Text>
          </Box>
        </Link>
      </Box>
      {/* Sağ Mobil Filtre butonu */}
      <Box flexShrink="0">
        <HStack spacing={4} align="center">
          {isMobile && location.pathname === "/" && (
            <HStack w={"6em"} spacing={0}>
              <IconButton
                aria-label="Filtrele"
                icon={<FaFilter />}
                variant="ghost"
                onClick={onOpenFilter}
              />
              <Text
                onClick={onOpenFilter}
                cursor="pointer"
                fontWeight="semibold"
                fontSize="md"
              >
                Filtre Uygula
              </Text>
            </HStack>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaUserCircle size="32" />}
              variant="outline"
              aria-label="Profil Menü"
              border="none"
              _hover={{ bg: "gray.200" }}
              _expanded={{ bg: "gray.200" }}
            />
            <MenuList color="black">
              {isLoggedIn ? (
                <>
                  <MenuItem as={Link} to="/profil">Profil</MenuItem>
                  {isAdmin && (
                    <MenuItem as={Link} to="/admin-paneli">
                      Admin Paneli
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem as={Link} to="/giris-yap">
                    Giriş Yap
                  </MenuItem>
                  <MenuItem as={Link} to="/kayit-ol">
                    Kayıt Ol
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </HStack>
      </Box>
    </Flex>
  );
};

export default Header;
