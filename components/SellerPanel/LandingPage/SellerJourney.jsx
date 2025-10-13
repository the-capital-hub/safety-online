"use client";

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

export default function SellerJourney() {
  const journey = [
    {
      step: "01",
      title: "Register & verify",
      copy: "Share GST, PAN, and bank details to unlock your seller workspace.",
    },
    {
      step: "02",
      title: "Launch your storefront",
      copy: "Bulk import SKUs, map categories, and publish a brand-grade catalogue.",
    },
    {
      step: "03",
      title: "Start fulfilling orders",
      copy: "Receive RFQs, negotiate, and ship using SafeTrade logistics or your own partner.",
    },
  ];

  return (
    <section className="border-y border-white/5 bg-slate-900/70 py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-20 lg:flex-row">
        {/* LEFT CONTENT */}
        <motion.div
          className="flex-1 flex flex-col justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span
            className={`${mont.className} inline-flex max-w-44 items-center rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/60`}
          >
            Seller journey
          </span>
          <h2
            className={`${outfit.className} mt-6 text-3xl font-semibold text-white sm:text-4xl`}
          >
            A guided path from registration to repeat buyers
          </h2>
          <p
            className={`${mont.className} mt-4 text-base text-slate-300/80`}
          >
            Every new partner receives onboarding support, merchandising assistance,
            and training so you can focus on product quality.
          </p>
        </motion.div>

        {/* RIGHT STEPS */}
        <div className={`flex-1 space-y-6 ${mont.className} `}>
          {journey.map((stage, index) => (
            <motion.div
              key={stage.step}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300/15 text-lg font-semibold text-amber-200">
                  {stage.step}
                </span>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {stage.title}
                  </h3>
                  <p className="text-base text-slate-300/80">{stage.copy}</p>
                </div>
              </div>
              {index < journey.length - 1 && (
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
