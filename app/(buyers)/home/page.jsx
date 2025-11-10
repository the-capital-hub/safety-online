import React from "react";
import Home from "@/components/BuyerPanel/home/Home.jsx";

export const metadata = {
        title: "Industrial & Workplace Safety Gear | Safety Online",
        description:
                "Discover certified industrial safety gear, workplace protection equipment, and expert guidance tailored for Indian businesses at Safety Online.",
};

const HomePage = () => {
        return (
                <main className="bg-white">
                        <h1 className="sr-only">
                                Safety Online – Industrial safety gear, compliance support, and protective equipment for Indian workplaces
                        </h1>
                        <p className="sr-only">
                                Browse curated collections of BIS-approved PPE, fire safety solutions, and on-demand guidance from Safety Online specialists to build safer workplaces across India.
                        </p>
                        <Home />
                </main>
        );
};

export default HomePage;
