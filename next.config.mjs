/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorar archivos .md en node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
      include: /node_modules/,
    });

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@libsql/isomorphic-ws');
    }
    return config;
  },
};

export default nextConfig;
