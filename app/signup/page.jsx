import SignupPageClient from "./SignupPageClient.jsx";

export const metadata = {
        title: "Create Your Safety Online Account | Start Managing Workplace Safety",
        description:
                "Register with Safety Online to source certified safety equipment, monitor compliance, and collaborate with experts supporting your workforce protection goals.",
        alternates: {
                canonical: "https://www.safetyonline.in/signup",
        },
};

export default function SignupPage() {
        return <SignupPageClient />;
}
