import ForgotPasswordPageClient from "./ForgotPasswordPageClient.jsx";

export const metadata = {
        title: "Forgot Password | Request Safety Online Login Link",
        description:
                "Recover your Safety Online account by requesting a secure password reset link and continue safeguarding your workforce with trusted equipment and support.",
        alternates: {
                canonical: "https://www.safetyonline.in/forgot-password",
        },
};

export default function ForgotPasswordPage() {
        return <ForgotPasswordPageClient />;
}
