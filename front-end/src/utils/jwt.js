import { jwtDecode } from "jwt-decode";

export const verifyAccessToken = (accessToken) => {
  return jwtDecode(accessToken, import.meta.env.VITE_JWT_ACCESS_SECRET);
};

export const verifyCredential = (credential) => {
  return jwtDecode(credential);
};
