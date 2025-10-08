"use client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Montserrat, Outfit } from "next/font/google";
import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const faqs = [
  {
    question: "What documents do I need to begin?",
    answer:
      "Register with your GST number, PAN, bank details, and any product certifications required for your category. Our onboarding team reviews everything within 24 hours.",
  },
  {
    question: "How are payments handled?",
    answer:
      "All transactions flow through SafeTrade's secure gateway. Settlements reach your registered bank account within 7–10 business days after delivery confirmation.",
  },
  {
    question: "Can I use my own logistics partner?",
    answer:
      "Absolutely. Choose SafeTrade Fulfilment for end-to-end logistics or integrate the partner you already trust. Buyers see transparent timelines either way.",
  },
  {
    question: "Do I need technical expertise to list products?",
    answer:
      "Not at all. Use guided templates, CSV uploaders, or let our merchandising team set up your catalogue during onboarding.",
  },
];

const FAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 overflow-hidden">
      <div className="absolute -bottom-20 -left-2 w-[300px] h-[300px] bg-[radial-gradient(circle_at_bottom_left,_rgba(255,189,46,0.15),_transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
      >
        {/* FAQ Content */}
        <div>
          <p
            className={`${mont.className} inline-flex items-center rounded-full bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200`}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Answers before you join
          </p>

          <h2
            className={`${outfit.className} mt-6 text-3xl font-semibold text-white`}
          >
            Frequently asked questions
          </h2>

          <div className="mt-8 space-y-4">
            {faqs.map((faq, index) => {
              const expanded = openFaq === index;
              return (
                <motion.div
                  key={faq.question}
                  layout
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? null : index)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left"
                  >
                    <span
                      className={`${outfit.className} text-lg font-semibold text-white`}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expanded ? -90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="h-5 w-5 text-amber-200" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      >
                        <div
                          className={`${mont.className} border-t border-white/5 px-6 py-6 text-sm text-slate-300/80`}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className={`${mont.className} flex flex-col justify-between rounded-3xl border border-amber-200/40 bg-gradient-to-br from-amber-300/10 via-amber-300/5 to-transparent p-5 text-slate-100`}
        >
          <div className="mx-auto mb-6">
            <svg
              width="182"
              height="182"
              viewBox="0 0 182 182"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M81.3784 34.5372H109.628L140.609 3.46219C141.485 2.57958 142.526 1.87904 143.674 1.40096C144.821 0.922893 146.052 0.676758 147.295 0.676758C148.538 0.676758 149.769 0.922893 150.916 1.40096C152.064 1.87904 153.105 2.57958 153.981 3.46219L178.276 27.8514C180.03 29.6157 181.014 32.0024 181.014 34.4901C181.014 36.9779 180.03 39.3645 178.276 41.1289L156.712 62.7872H81.3784V81.6205C81.3784 84.118 80.3863 86.5132 78.6203 88.2791C76.8543 90.0451 74.4592 91.0372 71.9617 91.0372C69.4643 91.0372 67.0691 90.0451 65.3031 88.2791C63.5372 86.5132 62.5451 84.118 62.5451 81.6205V53.3705C62.5451 48.3756 64.5293 43.5853 68.0612 40.0533C71.5932 36.5214 76.3835 34.5372 81.3784 34.5372ZM24.8784 81.6205V119.287L3.31423 140.851C1.56036 142.616 0.575928 145.002 0.575928 147.49C0.575928 149.978 1.56036 152.365 3.31423 154.129L27.6092 178.518C28.4846 179.401 29.5261 180.101 30.6736 180.579C31.8211 181.057 33.0519 181.303 34.2951 181.303C35.5382 181.303 36.769 181.057 37.9165 180.579C39.064 180.101 40.1055 179.401 40.9809 178.518L81.3784 138.121H119.045C121.543 138.121 123.938 137.128 125.704 135.362C127.47 133.596 128.462 131.201 128.462 128.704V119.287H137.878C140.376 119.287 142.771 118.295 144.537 116.529C146.303 114.763 147.295 112.368 147.295 109.871V100.454H156.712C159.209 100.454 161.604 99.4618 163.37 97.6958C165.136 95.9298 166.128 93.5347 166.128 91.0372V81.6205H100.212V91.0372C100.212 96.0321 98.2275 100.822 94.6956 104.354C91.1636 107.886 86.3733 109.871 81.3784 109.871H62.5451C57.5501 109.871 52.7598 107.886 49.2279 104.354C45.6959 100.822 43.7117 96.0321 43.7117 91.0372V62.7872L24.8784 81.6205Z"
                fill="#FFB82D"
              />
            </svg>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white">
              Your partner in every deal
            </h3>
            <p className="text-base text-slate-300/80">
              Call on our onboarding specialists, merchandisers, and logistics
              partners whenever you need an assist. We are only a WhatsApp away.
            </p>
            <div className="space-y-2 text-sm text-slate-200">
              <p className="font-semibold text-white">Dedicated helpline</p>
              <p>support@safetrade.in</p>
              <p>WhatsApp: +91 98765 43210</p>
            </div>
          </div>

          <Link
            href="/seller/login"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-200/30 transition hover:bg-amber-200"
          >
            Talk to an expert
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FAQ;
