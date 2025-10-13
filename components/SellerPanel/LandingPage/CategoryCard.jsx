"use client";

import React from "react";
import Image from "next/image";
import { Montserrat, Outfit } from "next/font/google";
import { Building2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import cone from "@/public/images/seller-panel/home/hero/cone.png";
import helmet from "@/public/images/seller-panel/home/hero/helmet.png";
import fire from "@/public/images/seller-panel/home/hero/fire.png";
import queue from "@/public/images/seller-panel/home/hero/Queue.png";
import sign from "@/public/images/seller-panel/home/hero/sign.png";
import jacket from "@/public/images/seller-panel/home/hero/jacket.png";

const outfit = Outfit({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--font-outfit",
});

const mont = Montserrat({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const categories = [
  { title: "Road Safety", img: cone },
  { title: "Industrial Safety", img: helmet },
  { title: "Fire Safety", img: fire },
  { title: "Q Manger", img: queue },
  { title: "Road Signs", img: sign },
  { title: "Road Safety", img: jacket },
];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" },
  }),
};

export default function CategoryCard() {
  return (
    <section className="relative overflow-hidden py-16">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,_rgba(255,189,46,0.12),_transparent_40%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-6 mb-10"
        >
          <motion.span
            variants={fadeUp}
            custom={0.1}
            className={`${mont.className} inline-flex items-center gap-2 rounded-full bg-[#FCD34D1A] text-[#FDE68A] px-4 py-2 text-sm font-medium w-fit`}
          >
            <Building2 className="h-4 w-4" />
            Built for every safety vertical
          </motion.span>

          <motion.div
            variants={fadeUp}
            custom={0.2}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <h2
              className={`${outfit.className} text-3xl md:text-4xl font-semibold text-white leading-snug`}
            >
              Launch catalogues across industrial,
              <br />
              municipal, and consumer needs
            </h2>

            <button className="inline-flex items-center gap-2 rounded-full border border-[#FDE68A]/30 bg-[#FDE68A]/10 px-4 py-2 text-[#FDE68A] text-sm font-medium hover:bg-[#FDE68A]/20 transition">
              Browse live marketplace
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-5"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={0.1 * i + 0.3}
              whileHover={{ scale: 1.05}}
              transition={{ type: "spring", stiffness: 180, damping: 15 }}
              className="rounded-2xl bg-[#11152B] border border-white/10 hover:border-[#FDE68A]/30 transition p-6 flex flex-col"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                width={250}
                height={70}
                className="mx-auto w-[70%] md:w-[60%] h-auto object-contain"
              />
              <p
                className={`${mont.className} text-left text-xl mt-5 text-white font-medium`}
              >
                {cat.title}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
