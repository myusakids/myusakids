/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pfhevhqzhnbqjnkljxzy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any https image for development seed data
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async redirects() {
    return [
      // Old WordPress slug format
      {
        source: "/ct_places/:slug",
        destination: "/listings/:slug",
        permanent: true,
      },
      // Old category URLs
      {
        source: "/camps",
        destination: "/categories/camps",
        permanent: true,
      },
      {
        source: "/camps/",
        destination: "/categories/camps",
        permanent: true,
      },
      {
        source: "/classes-and-programs",
        destination: "/categories/classes",
        permanent: true,
      },
      {
        source: "/classes-and-programs/",
        destination: "/categories/classes",
        permanent: true,
      },
      {
        source: "/sports-and-athletics",
        destination: "/categories/sports",
        permanent: true,
      },
      {
        source: "/sports-and-athletics/",
        destination: "/categories/sports",
        permanent: true,
      },
      {
        source: "/things-to-do",
        destination: "/categories/things-to-do",
        permanent: true,
      },
      {
        source: "/things-to-do/",
        destination: "/categories/things-to-do",
        permanent: true,
      },
      {
        source: "/birthday-parties",
        destination: "/categories/birthday-parties",
        permanent: true,
      },
      {
        source: "/birthday-parties/",
        destination: "/categories/birthday-parties",
        permanent: true,
      },
      {
        source: "/childcare",
        destination: "/categories/childcare",
        permanent: true,
      },
      {
        source: "/childcare/",
        destination: "/categories/childcare",
        permanent: true,
      },
      {
        source: "/education",
        destination: "/categories/education",
        permanent: true,
      },
      {
        source: "/education/",
        destination: "/categories/education",
        permanent: true,
      },
      {
        source: "/health-wellness",
        destination: "/categories/health",
        permanent: true,
      },
      {
        source: "/health-wellness/",
        destination: "/categories/health",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
