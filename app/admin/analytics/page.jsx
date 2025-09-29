import dynamic from "next/dynamic";

const AdminAnalytics = dynamic(
        () => import("@/components/AdminPanel/Analytics/AdminAnalytics.jsx"),
        { ssr: false }
);

export default function AdminAnalyticsPage() {
        return <AdminAnalytics />;
}
