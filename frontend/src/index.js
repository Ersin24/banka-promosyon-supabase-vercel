// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// src/index.js (en altına ekle)

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then((registration) => {
//         console.log("✅ Service Worker başarıyla kayıt oldu:", registration);

//         // Güncelleme kontrolü
//         registration.onupdatefound = () => {
//           const installingWorker = registration.installing;
//           installingWorker.onstatechange = () => {
//             if (installingWorker.state === "installed") {
//               if (navigator.serviceWorker.controller) {
//                 // Yeni içerik mevcut
//                 window.location.reload();
//               } 
//             }
//           };
//         };
//       })
//       .catch((err) => {
//         // console.error("🚨 Service Worker kaydı başarısız:", err);
//       });
//   });
// }
