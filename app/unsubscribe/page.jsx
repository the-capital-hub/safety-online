import UnsubscribePageClient from "./UnsubscribePageClient.jsx";

export const metadata = {
        title: "Unsubscribe from Safety Online Updates | Manage Email Preferences",
        description:
                "Confirm your email removal from Safety Online newsletters and continue controlling how you receive updates about industrial safety solutions.",
        alternates: {
                canonical: "https://www.safetyonline.in/unsubscribe",
        },
};

export default function UnsubscribePage() {
        return <UnsubscribePageClient />;
}
