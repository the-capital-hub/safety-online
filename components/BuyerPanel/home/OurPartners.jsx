"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo1 from "@/public/images/home/ikea-logo.png";

export default function PartnersSection() {
  const partners = [logo1];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-8 md:py-8 px-10 ">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
       Our Partners
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join hundreds of safety-focused organizations that trust us to protect
            their teams and assets.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-center justify-center w-full"
          variants={containerVariants}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center w-full"
            >
              <Image
                src={partner}
                alt="Company logo"
                width={150}
                priority
                className="object-contain"
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
