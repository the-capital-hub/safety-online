/** @type {import('next').NextConfig} */
const nextConfig = {
        images: {
                domains: ["res.cloudinary.com", "https://lh3.googleusercontent.com/d/"],
                remotePatterns: [
                        {
                                protocol: "https",
                                hostname: "lh3.googleusercontent.com",
                                port: "",
                                pathname: "/d/**",
                                search: "",
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
};

export default nextConfig;
