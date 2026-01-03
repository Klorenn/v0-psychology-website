/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Deshabilitar Turbopack para evitar errores con resolveAlias
  // Usaremos webpack en su lugar (configurado abajo)
  experimental: {
    turbo: false,
  },
  webpack: (config, { isServer }) => {
    // Excluir módulos de Node.js del bundle del cliente (fallback para webpack)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig