import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Só vale no "npm run dev": deixa abrir o site pelo celular na rede de casa
  // (ex.: http://192.168.15.14:3000). Sem isso o Next bloqueia o JavaScript
  // e nada que dependa de clique funciona (menu, busca de CEP...).
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
