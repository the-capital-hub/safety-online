"use client";

import { useState } from "react";
import Image from "next/image";
import { heroimage } from "@/public/images/seller-panel/home/hero";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Montserrat, Outfit } from "next/font/google";
import { motion } from "framer-motion";

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

export default function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const stats = [
    { label: "Active buyers across India", value: "58K+" },
    { label: "Verified safety SKUs", value: "12.4K" },
    { label: "Average seller rating", value: "4.8 / 5" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,189,46,0.15),_transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        {/* Content Wrapper */}
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-12 px-6 pt-16 pb-24 md:flex-row md:items-center md:justify-between">
          {/* LEFT SIDE */}
          <motion.div
            className="flex-1 flex flex-col items-center md:items-start space-y-8 text-center md:text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-4 w-4" />
              India’s trusted safety marketplace
            </motion.span>

            {/* Heading */}
            <motion.h1
              className={`${outfit.className} text-4xl font-bold leading-40 text-white md:text-5xl lg:text-6xl`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Sell safety products with confidence.
              <span className="block text-amber-300">
                Scale nationwide with SafeTrade.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className={`${mont.className} max-w-xl text-lg text-slate-200/80`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Showcase compliant catalogues, respond to high-intent buyers, and
              manage fulfilment on a platform built for safety innovators, OEMs,
              and distributors.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="flex flex-col gap-3 md:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                href="/seller/register"
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-300/20 transition hover:bg-amber-200"
              >
                Get started now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>

            {/* STATS */}
            <motion.dl
              className="mt-10 md:relative md:left-1/2 md:top-7 grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <dt className="text-sm uppercase tracking-wide text-slate-300/80">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold text-white">
                    {stat.value}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>

          {/* RIGHT SIDE IMAGE */}
          <motion.div
            className="relative flex flex-1 justify-center md:justify-end md:bottom-16"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-sm md:max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={heroimage}
                  alt="Safety commerce hero"
                  className="h-auto w-full rounded-2xl object-cover"
                  priority
                />
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-100">
                <ShieldCheck className="h-8 w-8 text-amber-300 flex-shrink-0" />
                <span>
                  Verified sellers enjoy dispute support, instant payouts, and
                  analytics that help them win repeat business.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
