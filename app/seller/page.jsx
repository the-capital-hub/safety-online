import Image from "next/image";
import Link from "next/link";
import {
        ArrowRight,
        BarChart3,
        Boxes,
        DollarSign,
        Headset,
        RefreshCw,
        ShieldCheck,
        Sparkles,
        Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/public/SafetyLogo.png";
import HeroIllustration from "@/public/images/home/HeroMan.png";

const platformPillars = [
        {
                title: "Launch faster",
                description:
                        "Get your catalogue live in days with assisted onboarding, GST-ready invoices, and automated compliance checks.",
                icon: Sparkles,
        },
        {
                title: "Operate confidently",
                description:
                        "Realtime order tracking, dispute resolution, and dedicated seller success partners keep operations running smoothly.",
                icon: ShieldCheck,
        },
        {
                title: "Grow with insights",
                description:
                        "Performance dashboards surface conversion trends, repeat buyers, and fulfilment health across every channel.",
                icon: BarChart3,
        },
];

const performanceHighlights = [
        { label: "Average monthly orders", value: "2.4k" },
        { label: "On-time payouts", value: "99.8%" },
        { label: "Seller satisfaction", value: "4.9/5" },
];

const operatingAdvantages = [
        {
                title: "Smart catalogue tools",
                description:
                        "Bulk upload SKUs, attach certifications, and manage seasonal pricing with version history built-in.",
                icon: Boxes,
        },
        {
                title: "Predictable payouts",
                description:
                        "Same-week settlements with transparent fee breakdowns, escrow protection, and automated reconciliations.",
                icon: DollarSign,
        },
        {
                title: "After-sales excellence",
                description:
                        "Coordinate returns, replacements, and maintenance schedules with our safety-first support workflows.",
                icon: RefreshCw,
        },
];

const testimonials = [
        {
                quote:
                        "Safety Online helped us digitise an offline catalogue of 800+ SKUs without losing speed. Orders now arrive pre-validated and fulfilment is a breeze.",
                name: "Ritu Sharma",
                role: "Director, GuardianPro Supplies",
        },
        {
                quote:
                        "Their seller success team is like an extension of ours. Insights on top performing industries let us plan production ahead of demand.",
                name: "Girish Patel",
                role: "Founder, Atlas Lifeline",
        },
];

const resourceLinks = [
        {
                title: "Seller onboarding checklist",
                description: "Step-by-step guide to publishing your storefront the right way.",
                href: "/seller/register",
        },
        {
                title: "Compliance and documentation",
                description: "Know the approvals and audits required for industrial safety gear.",
                href: "/seller/notifications",
        },
        {
                title: "Growth playbook",
                description: "Campaign ideas and buyer cohorts to scale your Safety Online presence.",
                href: "/seller/analytics-report",
        },
];

export default function SellerLandingPage() {
        return (
                <main className="min-h-screen bg-slate-950 text-slate-100">
                        <div className="relative overflow-hidden">
                                <div
                                        className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-slate-900/70 to-slate-950"
                                        aria-hidden
                                />
                                <div className="absolute inset-y-0 -right-1/3 w-2/3 opacity-40">
                                        <div className="h-full w-full rounded-full bg-emerald-700 blur-3xl" aria-hidden />
                                </div>

                                <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                                        <div className="flex items-center gap-3">
                                                <Image src={Logo} alt="Safety Online" className="h-10 w-auto" priority />
                                                <span className="text-lg font-semibold tracking-wide text-emerald-100">
                                                        Safety Online Sellers
                                                </span>
                                        </div>
                                        <nav className="hidden items-center gap-8 text-sm font-medium text-emerald-100/80 md:flex">
                                                <Link href="#platform" className="transition hover:text-white">
                                                        Platform
                                                </Link>
                                                <Link href="#advantages" className="transition hover:text-white">
                                                        Advantages
                                                </Link>
                                                <Link href="#stories" className="transition hover:text-white">
                                                        Stories
                                                </Link>
                                                <Link href="#resources" className="transition hover:text-white">
                                                        Resources
                                                </Link>
                                        </nav>
                                        <div className="hidden items-center gap-3 md:flex">
                                                <Button variant="ghost" asChild className="text-emerald-100 hover:text-white">
                                                        <Link href="/seller/login">Seller Login</Link>
                                                </Button>
                                                <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                                                        <Link href="/seller/register">Become a Seller</Link>
                                                </Button>
                                        </div>
                                </header>

                                <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-12 md:flex-row md:items-center">
                                        <div className="max-w-xl space-y-6">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-900/60 px-4 py-1 text-sm font-medium text-emerald-200">
                                                        <Sparkles className="h-4 w-4" /> Safety gear commerce, built for sellers
                                                </span>
                                                <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                                                        Launch your trusted safety storefront with confidence
                                                </h1>
                                                <p className="text-lg text-slate-200/80">
                                                        Showcase certified catalogues, fulfil complex B2B orders, and partner with a platform engineered for industrial-grade commerce.
                                                </p>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                        <Button
                                                                asChild
                                                                size="lg"
                                                                className="gap-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                                        >
                                                                <Link href="/seller/register">
                                                                        Start selling
                                                                        <ArrowRight className="h-4 w-4" />
                                                                </Link>
                                                        </Button>
                                                        <Button
                                                                variant="outline"
                                                                size="lg"
                                                                asChild
                                                                className="border-emerald-400/50 bg-transparent text-emerald-100 hover:bg-emerald-900/50"
                                                        >
                                                                <Link href="#resources">Explore resources</Link>
                                                        </Button>
                                                </div>
                                                <div className="grid gap-6 pt-6 sm:grid-cols-3">
                                                        {performanceHighlights.map((item) => (
                                                                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                                        <p className="text-2xl font-semibold text-white">{item.value}</p>
                                                                        <p className="text-sm text-slate-200/70">{item.label}</p>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                        <div className="relative flex w-full justify-center md:w-auto">
                                                <div className="relative">
                                                        <div className="absolute -inset-6 rounded-3xl bg-emerald-500/40 blur-2xl" aria-hidden />
                                                        <Image
                                                                src={HeroIllustration}
                                                                alt="Seller working on Safety Online platform"
                                                                className="relative z-10 h-auto w-full max-w-md"
                                                                priority
                                                        />
                                                </div>
                                        </div>
                                </section>
                        </div>

                        <section id="platform" className="mx-auto w-full max-w-6xl px-6 py-16">
                                <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
                                        <div className="space-y-6">
                                                <h2 className="text-3xl font-semibold text-white">A platform that scales with your ambitions</h2>
                                                <p className="text-base text-slate-200/80">
                                                        From onboarding to repeat fulfilment, Safety Online wraps expert workflows around every interaction. You focus on building remarkable safety products—we take care of everything else.
                                                </p>
                                                <div className="grid gap-6 sm:grid-cols-3">
                                                        {platformPillars.map(({ title, description, icon: Icon }) => (
                                                                <div key={title} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                                                                        <div className="flex items-center gap-3">
                                                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                                                                                        <Icon className="h-5 w-5" />
                                                                                </span>
                                                                                <h3 className="text-lg font-medium text-white">{title}</h3>
                                                                        </div>
                                                                        <p className="mt-3 text-sm text-slate-200/70">{description}</p>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>
                                        <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 p-6">
                                                <div className="space-y-3">
                                                        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200/80">Why sellers choose us</p>
                                                        <p className="text-lg text-slate-100/90">
                                                                7 of the top 10 industrial safety brands rely on Safety Online to expand across India with assured fulfilment support.
                                                        </p>
                                                </div>
                                                <div className="mt-8 space-y-3 text-sm text-slate-200/70">
                                                        <p className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-emerald-300" /> Dedicated seller success pods for each product category
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                                <Headset className="h-4 w-4 text-emerald-300" /> Proactive support covering onboarding, cataloguing, and logistics
                                                        </p>
                                                        <p className="flex items-center gap-2">
                                                                <ShieldCheck className="h-4 w-4 text-emerald-300" /> Compliance playbooks aligned with ISO, BIS, and factory safety norms
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section id="advantages" className="bg-slate-900/60 py-16">
                                <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-start">
                                        <div className="max-w-md space-y-4">
                                                <h2 className="text-3xl font-semibold text-white">Operate with confidence</h2>
                                                <p className="text-base text-slate-200/80">
                                                        Streamlined seller tools, predictable cash flow, and transparent buyer communications keep your brand trusted at every touchpoint.
                                                </p>
                                                <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                                                        <Link href="/seller/dashboard">Preview dashboards</Link>
                                                </Button>
                                        </div>
                                        <div className="grid flex-1 gap-6 md:grid-cols-3">
                                                {operatingAdvantages.map(({ title, description, icon: Icon }) => (
                                                        <div key={title} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                                                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                                                                        <Icon className="h-6 w-6" />
                                                                </span>
                                                                <h3 className="text-lg font-medium text-white">{title}</h3>
                                                                <p className="text-sm text-slate-200/70">{description}</p>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section id="stories" className="mx-auto w-full max-w-6xl px-6 py-16">
                                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                                        <div className="max-w-md space-y-4">
                                                <h2 className="text-3xl font-semibold text-white">Sellers growing with Safety Online</h2>
                                                <p className="text-base text-slate-200/80">
                                                        Hear from leaders who modernised operations, expanded nationwide, and built deeper trust with enterprise buyers.
                                                </p>
                                        </div>
                                        <div className="grid flex-1 gap-6 md:grid-cols-2">
                                                {testimonials.map(({ quote, name, role }) => (
                                                        <figure key={name} className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                                                                <blockquote className="text-sm leading-relaxed text-slate-200/80">“{quote}”</blockquote>
                                                                <figcaption className="mt-6">
                                                                        <p className="text-sm font-semibold text-white">{name}</p>
                                                                        <p className="text-xs text-slate-400">{role}</p>
                                                                </figcaption>
                                                        </figure>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section id="resources" className="bg-slate-900/60 py-16">
                                <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center">
                                        <div className="max-w-md space-y-4">
                                                <h2 className="text-3xl font-semibold text-white">Resources to keep you ahead</h2>
                                                <p className="text-base text-slate-200/80">
                                                        Download curated playbooks, compliance guides, and platform walkthroughs designed to help your team scale safely.
                                                </p>
                                        </div>
                                        <div className="grid flex-1 gap-6 md:grid-cols-3">
                                                {resourceLinks.map(({ title, description, href }) => (
                                                        <Link
                                                                key={title}
                                                                href={href}
                                                                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/70 p-5 transition hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                                                        >
                                                                <div>
                                                                        <h3 className="text-lg font-medium text-white">{title}</h3>
                                                                        <p className="mt-3 text-sm text-slate-200/70">{description}</p>
                                                                </div>
                                                                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                                                                        Explore <ArrowRight className="h-4 w-4" />
                                                                </span>
                                                        </Link>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section id="cta" className="mx-auto w-full max-w-6xl px-6 py-20">
                                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 px-8 py-12">
                                        <div className="absolute -right-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-emerald-500/40 blur-3xl" aria-hidden />
                                        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                                <div className="max-w-xl space-y-3">
                                                        <h2 className="text-3xl font-semibold text-white">Ready to elevate your safety brand?</h2>
                                                        <p className="text-base text-slate-200/80">
                                                                Join India’s fastest-growing industrial safety marketplace and give buyers a storefront they can trust.
                                                        </p>
                                                </div>
                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                        <Button asChild size="lg" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                                                                <Link href="/seller/register">Apply to sell</Link>
                                                        </Button>
                                                        <Button
                                                                asChild
                                                                size="lg"
                                                                variant="outline"
                                                                className="border-emerald-400/50 text-emerald-100 hover:bg-emerald-900/40"
                                                        >
                                                                <Link href="/seller/login">Talk to our team</Link>
                                                        </Button>
                                                </div>
                                        </div>
                                </div>
                        </section>
                </main>
        );
}
