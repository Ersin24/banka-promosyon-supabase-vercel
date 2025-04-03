// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import {
  Flex,
  Box,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PostGrid from "./components/PostGrid";
import PostDetail from "./components/PostDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound.js";
import AdminRoute from "./components/AdminRoute.js";

const Layout = ({ children, showSidebar }) => {
  return (

    <Flex minHeight={"83vh"} maxW={{base: "100%", md: "70%"}} mx={"auto"} p={4}>
      {showSidebar && (
        <Box
          w={{ base: "0", md: "20%" }}
          p={4}
          bg="#fff"
          borderRight={"1px"}
          display={{ base: "none", md: "block" }}
        >
          <Sidebar />
        </Box>
      )}
      <Box flex={1} p={4}>
        {children}
      </Box>
    </Flex>
  );
};

const AppContent = () => {
  const location = useLocation();
  // Masaüstünde sadece ana sayfada Sidebar gösterilsin
  const showSidebarDesktop = location.pathname === "/";
  return (
    <Layout showSidebar={showSidebarDesktop}>
      <Routes>
        <Route path="/" element={<PostGrid />} />
        <Route path="/giris-yap" element={<Login />} />
        <Route path="/kayit-ol" element={<Register />} />
        <Route path="/admin-paneli" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
        <Route path="/kampanyalar/:id" element={<PostDetail />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Router>
      <Header onOpenFilter={onOpen} />
     
      {isMobile && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Filtrele</DrawerHeader>
            <DrawerBody>
              <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
      <AppContent />
      
      <Footer />
    </Router>
  );
}

export default App;
