"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import dashboard from "@/public/images/seller-panel/home/hero/sellerdashboard.png";
import { CircleCheck } from "lucide-react";
import { Montserrat } from "next/font/google";

const mont = Montserrat({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const SellerDashboard = () => {
  return (
    <div className="min-h-screen max-w-7xl mx-auto w-full flex flex-col items-center justify-center overflow-hidden gap-5 py-5">
      {/* Title Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.8 }}
        className={`${mont.className} flex items-center gap-2 text-[#FDE68A] bg-[#FCD34D1A] text-lg md:text-xl font-semibold px-4 py-1 rounded-full backdrop-blur-md`}
      >
        <CircleCheck className="w-5 h-5" />
        Seller Admin Dashboard
      </motion.div>

      {/* Dashboard Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 80 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
        className="w-[95%] md:w-[80%] lg:w-[70%] relative overflow-hidden"
      >
        <Image
          src={dashboard}
          alt="Seller Admin Dashboard"
          className="w-full h-auto object-cover rounded-2xl shadow-2xl "
          priority
        />
      </motion.div>
    </div>
  );
};

export default SellerDashboard;
