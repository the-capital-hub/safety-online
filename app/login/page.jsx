import LoginPageClient from "./LoginPageClient.jsx";

export const metadata = {
        title: "Login to Safety Online | Access Your Safety Solutions Dashboard",
        description:
                "Sign in to your Safety Online account to manage safety gear orders, track compliance support, and access personalized workplace protection resources.",
        alternates: {
                canonical: "https://www.safetyonline.in/login",
        },
};

export default function LoginPage() {
        return <LoginPageClient />;
}
