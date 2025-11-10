import ResetPasswordPageClient from "./ResetPasswordPageClient.jsx";

export const metadata = {
        title: "Reset Your Safety Online Password | Regain Secure Access",
        description:
                "Create a new Safety Online password to safely return to your dashboard, continue purchasing protective gear, and manage workplace safety resources.",
        alternates: {
                canonical: "https://www.safetyonline.in/reset-password",
        },
};

export default function ResetPasswordPage() {
        return <ResetPasswordPageClient />;
}
