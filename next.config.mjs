/** @type {import('next').NextConfig} */
const nextConfig = {
        images: {
                remotePatterns: [
                        {
                                protocol: "https",
                                hostname: "res.cloudinary.com",
                                pathname: "/**",
                        },
                        {
                                protocol: "https",
                                hostname: "lh3.googleusercontent.com",
                                pathname: "/d/**",
                        },
                ],
        },
        async headers() {
                return [
                        {
                                source: "/(.*)",
                                headers: [
                                        {
                                                key: "Strict-Transport-Security",
                                                value: "max-age=31536000; includeSubDomains; preload",
                                        },
                                ],
                        },
                ];
        },
        async redirects() {
                return [
                        {
                                source: '/',
                                destination: '/home',
                                permanent: true,
                        },
                ];
        },
};

export default nextConfig;
