import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.stockx.com" },
      { protocol: "https", hostname: "**.stockx.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      { source: "/prodotti", destination: "/products", permanent: true },
      { source: "/prodotti/:slug", destination: "/products/:slug", permanent: true },
      { source: "/carrello", destination: "/cart", permanent: true },
      { source: "/spedizioni", destination: "/shipping", permanent: true },
      { source: "/resi", destination: "/returns", permanent: true },
      { source: "/ordine/:number", destination: "/order/:number", permanent: true },
      { source: "/account/indirizzi", destination: "/account/addresses", permanent: true },
      { source: "/account/ordini", destination: "/account/orders", permanent: true },
      { source: "/account/ordini/:id", destination: "/account/orders/:id", permanent: true },
      { source: "/account/profilo", destination: "/account/profile", permanent: true },
      { source: "/admin/prodotti", destination: "/admin/products", permanent: true },
      { source: "/admin/prodotti/nuovo", destination: "/admin/products/nuovo", permanent: true },
      { source: "/admin/prodotti/:id", destination: "/admin/products/:id", permanent: true },
    ];
  },
};

export default nextConfig;
