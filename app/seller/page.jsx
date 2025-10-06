"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
        ArrowRight,
        Building2,
        CheckCircle2,
        Headset,
        Layers,
        LineChart,
        ShieldCheck,
        Sparkles,
        Store,
        UsersRound,
} from "lucide-react";
import {
        VideoBanner,
        Logo1,
        Logo2,
        Logo3,
        Logo4,
        Logo5,
        Logo6,
} from "@/public/images/seller-panel/home/hero";
import Image1 from "@/public/images/seller-panel/home/product-categories/Image1.png";
import Image2 from "@/public/images/seller-panel/home/product-categories/Image2.png";
import Image3 from "@/public/images/seller-panel/home/product-categories/Image3.png";
import Image4 from "@/public/images/seller-panel/home/product-categories/Image4.png";
import Image5 from "@/public/images/seller-panel/home/product-categories/Image5.png";
import Image6 from "@/public/images/seller-panel/home/product-categories/Image6.png";
import avatar1 from "@/public/images/avatar/avatar1.png";
import avatar2 from "@/public/images/avatar/avatar2.png";

const stats = [
        { label: "Active buyers across India", value: "58K+" },
        { label: "Verified safety SKUs", value: "12.4K" },
        { label: "Average seller rating", value: "4.8 / 5" },
];

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

const categories = [
        {
                name: "Traffic & road control",
                description: "Cones, barricades, bollards, and reflective signage.",
                image: Image1,
        },
        {
                name: "Fire safety systems",
                description: "Extinguishers, detectors, sprinklers, and cabinets.",
                image: Image2,
        },
        {
                name: "Visibility & apparel",
                description: "Reflective jackets, gloves, and protective uniforms.",
                image: Image3,
        },
        {
                name: "Industrial PPE",
                description: "Helmets, harnesses, respirators, and impact gear.",
                image: Image4,
        },
        {
                name: "Emergency response",
                description: "First-aid kits, stretchers, and evacuation hardware.",
                image: Image5,
        },
        {
                name: "Smart infrastructure",
                description: "IoT beacons, speed displays, and traffic analytics.",
                image: Image6,
        },
];

const testimonials = [
        {
                name: "Siddharth Arora",
                role: "Founder, SafetyGear India",
                quote:
                        "We went from servicing three states to thirteen with SafeTrade. The verified buyer network changed the pace of our business.",
                avatar: avatar1,
        },
        {
                name: "Ritika Mehra",
                role: "Director, FireLine Equipments",
                quote:
                        "Uploading 50+ SKUs took minutes. The merchandising tools and analytics give my team clarity every single day.",
                avatar: avatar2,
        },
];

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

const logos = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6];

function IconPill({ icon: Icon }) {
        return (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
                        <Icon className="h-6 w-6" />
                </div>
        );
}

export default function SellerLandingPage() {
        const [openFaq, setOpenFaq] = useState(null);

        return (
                <div className="bg-slate-950 text-slate-100">
                        <section className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,189,46,0.15),_transparent_60%)]" />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                                <div className="relative mx-auto flex min-h-[620px] w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 sm:px-10 lg:flex-row lg:items-center">
                                        <div className="flex-1 space-y-8">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-amber-300">
                                                        <Sparkles className="h-4 w-4" />
                                                        India’s trusted safety marketplace
                                                </span>
                                                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                                        Sell safety products with confidence.
                                                        <span className="block text-amber-300">Scale nationwide with SafeTrade.</span>
                                                </h1>
                                                <p className="max-w-xl text-lg text-slate-200/80">
                                                        Showcase compliant catalogues, respond to high-intent buyers, and manage fulfilment on a platform built for safety innovators, OEMs, and distributors.
                                                </p>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                        <Link
                                                                href="/seller/register"
                                                                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-300/20 transition hover:bg-amber-200"
                                                        >
                                                                Get started now
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                                href="/seller/login"
                                                                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-amber-200 hover:text-amber-200"
                                                        >
                                                                Preview seller workspace
                                                        </Link>
                                                </div>
                                                <dl className="grid gap-6 sm:grid-cols-3">
                                                        {stats.map((stat) => (
                                                                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                                                                        <dt className="text-sm uppercase tracking-wide text-slate-300/80">
                                                                                {stat.label}
                                                                        </dt>
                                                                        <dd className="mt-2 text-2xl font-semibold text-white">{stat.value}</dd>
                                                                </div>
                                                        ))}
                                                </dl>
                                        </div>
                                        <div className="relative flex flex-1 justify-end">
                                                <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                                                        <div className="rounded-2xl bg-black/70 p-1">
                                                                <Image
                                                                        src={VideoBanner}
                                                                        alt="Safety commerce hero"
                                                                        className="h-full w-full rounded-2xl object-cover"
                                                                        priority
                                                                />
                                                        </div>
                                                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-900/70 p-4 text-sm text-slate-100">
                                                                <ShieldCheck className="h-5 w-5 text-amber-300" />
                                                                <span>
                                                                        Verified sellers enjoy dispute support, instant payouts, and analytics that help them win repeat business.
                                                                </span>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section className="border-y border-white/5 bg-slate-900/60 py-12">
                                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-10 px-6">
                                        {logos.map((logo, index) => (
                                                <Image
                                                        key={index}
                                                        src={logo}
                                                        alt="Partner logo"
                                                        height={40}
                                                        width={140}
                                                        className="h-10 w-auto opacity-70 grayscale transition hover:opacity-100"
                                                />
                                        ))}
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
                                <div className="mb-12 max-w-2xl">
                                        <p className="inline-flex items-center rounded-full bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                                <Store className="mr-2 h-4 w-4" />
                                                Why sellers choose SafeTrade
                                        </p>
                                        <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                                                Everything you need to turn safety expertise into scalable commerce
                                        </h2>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2">
                                        {features.map((feature) => (
                                                <div
                                                        key={feature.title}
                                                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/40 p-8 transition hover:border-amber-200/60 hover:shadow-xl hover:shadow-amber-300/20"
                                                >
                                                        <div className="mb-6 flex items-center gap-3">
                                                                <IconPill icon={feature.icon} />
                                                                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                                        </div>
                                                        <p className="text-base text-slate-300/80">{feature.description}</p>
                                                </div>
                                        ))}
                                </div>
                        </section>

                        <section className="border-y border-white/5 bg-slate-900/70 py-20">
                                <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 sm:px-10 lg:flex-row">
                                        <div className="flex-1">
                                                <p className="inline-flex items-center rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/60">
                                                        Seller journey
                                                </p>
                                                <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                                                        A guided path from registration to repeat buyers
                                                </h2>
                                                <p className="mt-4 text-base text-slate-300/80">
                                                        Every new partner receives onboarding support, merchandising assistance, and training so you can focus on product quality.
                                                </p>
                                        </div>
                                        <div className="flex-1 space-y-6">
                                                {journey.map((stage, index) => (
                                                        <div key={stage.step} className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                                                                <div className="flex items-start gap-5">
                                                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300/15 text-lg font-semibold text-amber-200">
                                                                                {stage.step}
                                                                        </span>
                                                                        <div className="space-y-2">
                                                                                <h3 className="text-xl font-semibold text-white">{stage.title}</h3>
                                                                                <p className="text-base text-slate-300/80">{stage.copy}</p>
                                                                        </div>
                                                                </div>
                                                                {index < journey.length - 1 && (
                                                                        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                                                )}
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
                                <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                        <div className="max-w-2xl">
                                                <p className="inline-flex items-center rounded-full bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                                        <Building2 className="mr-2 h-4 w-4" />
                                                        Built for every safety vertical
                                                </p>
                                                <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                                                        Launch catalogues across industrial, municipal, and consumer needs
                                                </h2>
                                        </div>
                                        <Link
                                                href="/seller/login"
                                                className="inline-flex items-center rounded-full border border-amber-300/40 px-5 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300 hover:text-slate-950"
                                        >
                                                Browse live marketplaces
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {categories.map((category) => (
                                                <div
                                                        key={category.name}
                                                        className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-amber-200/60 hover:shadow-lg hover:shadow-amber-300/20"
                                                >
                                                        <div className="relative h-44 overflow-hidden">
                                                                <Image
                                                                        src={category.image}
                                                                        alt={category.name}
                                                                        fill
                                                                        sizes="(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 640px) 45vw, 100vw"
                                                                        className="object-cover transition duration-500 group-hover:scale-105"
                                                                />
                                                        </div>
                                                        <div className="flex flex-1 flex-col gap-3 p-6">
                                                                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                                                                <p className="text-sm text-slate-300/80">{category.description}</p>
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                        </section>

                        <section className="border-y border-white/5 bg-slate-900/60 py-20">
                                <div className="mx-auto max-w-6xl px-6 sm:px-10">
                                        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                        <p className="inline-flex items-center rounded-full bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300/60">
                                                                Social proof
                                                        </p>
                                                        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                                                Sellers growing with SafeTrade
                                                        </h2>
                                                </div>
                                                <div className="flex items-center gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200">
                                                        <UsersRound className="h-6 w-6 text-amber-200" />
                                                        <div>
                                                                <p className="font-semibold text-white">92% sellers renew annually</p>
                                                                <p className="text-slate-300/70">Because repeat orders and support simply work.</p>
                                                        </div>
                                                </div>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                                {testimonials.map((testimonial) => (
                                                        <div key={testimonial.name} className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-lg shadow-black/20">
                                                                <div className="flex items-center gap-4">
                                                                        <Image
                                                                                src={testimonial.avatar}
                                                                                alt={testimonial.name}
                                                                                height={56}
                                                                                width={56}
                                                                                className="h-14 w-14 rounded-full border border-amber-200/50 object-cover"
                                                                        />
                                                                        <div>
                                                                                <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                                                                                <p className="text-sm text-amber-200/80">{testimonial.role}</p>
                                                                        </div>
                                                                </div>
                                                                <p className="text-base leading-relaxed text-slate-300/80">“{testimonial.quote}”</p>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
                                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                                        <div>
                                                <p className="inline-flex items-center rounded-full bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Answers before you join
                                                </p>
                                                <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                                                        Frequently asked questions
                                                </h2>
                                                <div className="mt-8 space-y-4">
                                                        {faqs.map((faq, index) => {
                                                                const expanded = openFaq === index;
                                                                return (
                                                                        <div key={faq.question} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                                                                                <button
                                                                                        type="button"
                                                                                        onClick={() => setOpenFaq(expanded ? null : index)}
                                                                                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                                                                                >
                                                                                        <span className="text-base font-semibold text-white">{faq.question}</span>
                                                                                        <ArrowRight
                                                                                                className={`h-5 w-5 text-amber-200 transition-transform ${expanded ? "rotate-90" : "rotate-0"}`}
                                                                                        />
                                                                                </button>
                                                                                {expanded && (
                                                                                        <div className="border-t border-white/5 px-6 pb-6 text-sm text-slate-300/80">
                                                                                                {faq.answer}
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </div>
                                        <div className="flex flex-col justify-between rounded-3xl border border-amber-200/40 bg-gradient-to-br from-amber-300/10 via-amber-300/5 to-transparent p-10 text-slate-100">
                                                <div className="space-y-6">
                                                        <h3 className="text-2xl font-semibold text-white">Your partner in every deal</h3>
                                                        <p className="text-base text-slate-300/80">
                                                                Call on our onboarding specialists, merchandisers, and logistics partners whenever you need an assist. We are only a WhatsApp away.
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
                                        </div>
                                </div>
                        </section>

                        <section className="relative overflow-hidden py-20">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-300/20 via-amber-400/20 to-amber-200/10" />
                                <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-16 text-center shadow-xl shadow-amber-300/20 backdrop-blur sm:px-12">
                                        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                                                Ready to put safety products in front of serious buyers?
                                        </h2>
                                        <p className="max-w-2xl text-base text-slate-200/80">
                                                Join SafeTrade today and unlock institutional demand, transparent payments, and analytics tuned for the safety economy.
                                        </p>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                                <Link
                                                        href="/seller/register"
                                                        className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-200/30 transition hover:bg-white"
                                                >
                                                        Create my seller account
                                                </Link>
                                                <Link
                                                        href="/seller/login"
                                                        className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:border-amber-200 hover:text-amber-200"
                                                >
                                                        Book a 15-min walkthrough
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                        </div>
                                </div>
                        </section>
                </div>
        );
}

