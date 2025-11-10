import { redirect } from "next/navigation";

export const metadata = {
        title: "Safety Online | Workplace Safety Gear & Compliance Support",
        description:
                "Explore Safety Online for certified PPE, fire protection, and workplace compliance guidance tailored to Indian industries.",
        alternates: {
                canonical: "https://www.safetyonline.in/",
        },
};

const Home = () => {
        redirect("/home");
};

export default Home;
