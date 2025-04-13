import { jwtDecode } from "jwt-decode";

// Token geçerliyse true, geçersizse false döner
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // Geçerlilik kontrolü
  } catch {
    return false;
  }
};

// Admin mi kontrol eder
export const isAdminUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.isAdmin === true && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
