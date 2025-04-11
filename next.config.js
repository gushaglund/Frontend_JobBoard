const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/home',
  //       permanent: false, // Set to `true` for a 301 redirect, `false` for 307
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
