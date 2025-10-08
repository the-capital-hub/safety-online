"use client";

import React from "react";
import {
  Headset,
  Layers,
  LineChart,
  ShieldCheck,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Catalog built for compliance",
    description:
      "Upload products with certifications, HS codes, and spec sheets in one go.",
    icon: Layers,
  },
  {
    title: "Insights that drive growth",
    description:
      "Track inquiries, repeat orders, and payout timelines from a unified dashboard.",
    icon: LineChart,
  },
  {
    title: "Trust badges that convert",
    description:
      "Get safety, quality, and fulfilment badges that boost buyer confidence instantly.",
    icon: ShieldCheck,
  },
  {
    title: "Always-on partner support",
    description:
      "Dedicated onboarding specialists plus WhatsApp support for your team.",
    icon: Headset,
  },
];

function IconPill({ icon: Icon }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
      <Icon className="h-6 w-6" />
    </div>
  );
}

const WhySellerChoose = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 sm:px-10">
      {/* Subtle smaller radial gradient in top-left */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_2%,_rgba(255,189,46,0.1),_transparent_40%)] pointer-events-none" />

      <motion.div
        className="relative mb-12 max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="inline-flex items-center rounded-full bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
          <Store className="mr-2 h-4 w-4" />
          Why sellers choose SafeTrade
        </p>
        <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
          Everything you need to turn safety expertise into scalable commerce
        </h2>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="relative grid gap-6 md:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/40 p-8 transition hover:border-amber-200/60 hover:shadow-xl hover:shadow-amber-300/20"
          >
            <div className="mb-6 flex items-center gap-3">
              <IconPill icon={feature.icon} />
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-base text-slate-300/80">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhySellerChoose;
