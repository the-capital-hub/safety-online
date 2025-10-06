import Image from "next/image";
import Link from "next/link";
import {
        ArrowRight,
        Headset,
        LineChart,
        PackageCheck,
        ShieldCheck,
        Sparkles,
        Store,
        Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/public/SafetyLogo.png";
import HeroIllustration from "@/public/images/home/HeroMan.png";

const featureHighlights = [
        {
                title: "Certified safety catalogues",
                description:
                        "Shop rigorously tested helmets, harnesses, and industrial gear curated by our in-house experts.",
                icon: ShieldCheck,
        },
        {
                title: "Logistics with live visibility",
                description:
                        "Track every parcel from warehouse to doorstep with proactive updates and dedicated support.",
                icon: PackageCheck,
        },
        {
                title: "Specialised business onboarding",
                description:
                        "Bulk procurement workflows, GST-ready invoices, and negotiated pricing tailored to your sector.",
                icon: Store,
        },
];

const trustMetrics = [
        { label: "Enterprise buyers", value: "12k+" },
        { label: "Verified safety SKUs", value: "48k" },
        { label: "Fulfilment accuracy", value: "99.4%" },
];

const capabilityPillars = [
        {
                title: "Human support at every step",
                description:
                        "A safety concierge team resolves sourcing queries, compliance checks, and escalations 24/7.",
                icon: Headset,
        },
        {
                title: "Insights that reduce risk",
                description:
                        "Real-time dashboards highlight supply gaps, product performance, and training readiness across sites.",
                icon: LineChart,
        },
        {
                title: "Powered by purpose-built tech",
                description:
                        "From digital catalogues to automated settlements, every interaction reflects the Safety Online promise.",
                icon: Sparkles,
        },
];

const testimonials = [
        {
                quote:
                        "Safety Online brought every vendor conversation into one transparent space. Procurement now feels calm, not chaotic.",
                name: "Ravi Narayan",
                role: "Chief Safety Officer, Meridian Infra",
        },
        {
                quote:
                        "Our field teams trust the gear because it is curated for Indian standards. Deliveries are quick and consistent.",
                name: "Ananya Bose",
                role: "Operations Head, GreenGrid Renewables",
        },
];

const partnerBadges = [
        "HarbourShield",
        "NorthStar Tools",
        "TruSafe Helmets",
        "GuardianPro",
        "Atlas Lifeline",
];

export default function Home() {
        return (
                <main className="min-h-screen bg-slate-950 text-slate-100">
                        <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-slate-900/70 to-slate-950" aria-hidden="true" />
                                <div className="absolute inset-y-0 -right-1/3 w-2/3 opacity-40">
                                        <div className="h-full w-full rounded-full bg-cyan-700 blur-3xl" aria-hidden="true" />
                                </div>

                                <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                                        <div className="flex items-center gap-3">
                                                <Image
                                                        src={Logo}
                                                        alt="Safety Online logo"
                                                        className="h-10 w-auto"
                                                        priority
                                                />
                                                <span className="text-lg font-semibold tracking-wide text-cyan-100">
                                                        Safety Online
                                                </span>
                                        </div>
                                        <nav className="hidden items-center gap-8 text-sm font-medium text-cyan-100/80 md:flex">
                                                <Link href="#solutions" className="transition hover:text-white">
                                                        Solutions
                                                </Link>
                                                <Link href="#capabilities" className="transition hover:text-white">
                                                        Capabilities
                                                </Link>
                                                <Link href="#testimonials" className="transition hover:text-white">
                                                        Stories
                                                </Link>
                                                <Link href="#cta" className="transition hover:text-white">
                                                        Contact
                                                </Link>
                                        </nav>
                                        <div className="hidden items-center gap-3 md:flex">
                                                <Button asChild variant="ghost" className="text-cyan-100 hover:text-white">
                                                        <Link href="/login">Sign in</Link>
                                                </Button>
                                                <Button
                                                        asChild
                                                        className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-300"
                                                >
                                                        <Link href="/signup" className="flex items-center gap-2">
                                                                Start buying
                                                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                        </Link>
                                                </Button>
                                        </div>
                                </header>

                                <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
                                        <div className="space-y-6">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-1 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-500/30">
                                                        Built for people who protect others
                                                </span>
                                                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                                        Where safety-first brands meet thoughtful technology
                                                </h1>
                                                <p className="max-w-xl text-lg text-slate-200/80">
                                                        Safety Online is India’s dedicated marketplace for trusted personal protective equipment.
                                                        Discover premium catalogues, plan procurement with confidence, and onboard sellers who
                                                        share your safety promise.
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4">
                                                        <Button
                                                                asChild
                                                                size="lg"
                                                                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-300"
                                                        >
                                                                <Link href="/home" className="flex items-center gap-2">
                                                                        Explore marketplace
                                                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                                                </Link>
                                                        </Button>
                                                        <Button
                                                                asChild
                                                                size="lg"
                                                                variant="outline"
                                                                className="border-cyan-400/60 bg-transparent text-cyan-100 hover:bg-cyan-500/10 hover:text-white"
                                                        >
                                                                <Link href="/seller" className="flex items-center gap-2">
                                                                        Become a seller
                                                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                                                </Link>
                                                        </Button>
                                                </div>

                                                <dl className="grid gap-6 sm:grid-cols-3">
                                                        {trustMetrics.map((metric) => (
                                                                <div
                                                                        key={metric.label}
                                                                        className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                                                                >
                                                                        <dt className="text-sm uppercase tracking-wide text-cyan-100/80">
                                                                                {metric.label}
                                                                        </dt>
                                                                        <dd className="mt-2 text-3xl font-semibold text-white">{metric.value}</dd>
                                                                </div>
                                                        ))}
                                                </dl>
                                        </div>
                                        <div className="relative flex items-center justify-center">
                                                <div className="absolute inset-0 -m-10 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
                                                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 p-8 shadow-2xl">
                                                        <Image
                                                                src={HeroIllustration}
                                                                alt="Illustration of a safety professional with protective gear"
                                                                className="h-auto w-full"
                                                                priority
                                                        />
                                                        <div className="mt-6 space-y-4 rounded-2xl bg-slate-900/80 p-6 text-sm text-slate-200/80">
                                                                <p className="font-medium text-cyan-100">What’s new on Safety Online</p>
                                                                <ul className="space-y-3">
                                                                        <li className="flex items-center gap-3">
                                                                                <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
                                                                                Hazard-ready kits for construction, oil &amp; gas, and wind energy teams.
                                                                        </li>
                                                                        <li className="flex items-center gap-3">
                                                                                <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
                                                                                Single dashboard to monitor delivery, returns, and compliance certificates.
                                                                        </li>
                                                                        <li className="flex items-center gap-3">
                                                                                <span className="h-2 w-2 rounded-full bg-cyan-400" aria-hidden="true" />
                                                                                Dedicated onboarding for sellers with brand storytelling workshops.
                                                                        </li>
                                                                </ul>
                                                        </div>
                                                </div>
                                        </div>
                                </section>
                        </div>

                        <section
                                id="solutions"
                                className="mx-auto mt-16 max-w-6xl space-y-12 px-6 py-10"
                        >
                                <div className="flex flex-col gap-4 text-center">
                                        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                                                Designed for procurement teams, facility leads, and safety champions
                                        </h2>
                                        <p className="mx-auto max-w-3xl text-base text-slate-200/80">
                                                Every workflow on Safety Online is tuned for reliability—from catalogue discovery to last-mile
                                                fulfilment. Experience the warmth of a brand that understands how critical safety supplies are
                                                to your teams.
                                        </p>
                                </div>
                                <div className="grid gap-6 md:grid-cols-3">
                                        {featureHighlights.map((feature) => (
                                                <article
                                                        key={feature.title}
                                                        className="group rounded-3xl border border-white/5 bg-slate-900/60 p-7 shadow-lg transition hover:border-cyan-400/60 hover:bg-slate-900/90"
                                                >
                                                        <feature.icon className="h-10 w-10 text-cyan-300" aria-hidden="true" />
                                                        <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                                                        <p className="mt-3 text-sm leading-relaxed text-slate-200/80">
                                                                {feature.description}
                                                        </p>
                                                </article>
                                        ))}
                                </div>
                        </section>

                        <section id="capabilities" className="bg-slate-900/70 py-16">
                                <div className="mx-auto max-w-6xl px-6">
                                        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                                                <div>
                                                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                                                                BEYOND THE CART
                                                        </p>
                                                        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                                                                Everything you need to protect people, powered by a single partner
                                                        </h2>
                                                        <p className="mt-4 text-base text-slate-200/80">
                                                                Bring buyers, sellers, operations, and finance onto one intuitive platform. Our technology
                                                                strengthens compliance, while our service teams ensure every order arrives when it matters
                                                                the most.
                                                        </p>
                                                        <div className="mt-8 grid gap-6 sm:grid-cols-3">
                                                                {capabilityPillars.map((pillar) => (
                                                                        <div key={pillar.title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                                                                                <pillar.icon className="h-9 w-9 text-cyan-300" aria-hidden="true" />
                                                                                <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
                                                                                <p className="mt-2 text-sm text-slate-200/80">{pillar.description}</p>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </div>
                                                <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl">
                                                        <h3 className="text-2xl font-semibold text-white">Why sellers choose Safety Online</h3>
                                                        <ul className="mt-6 space-y-5 text-sm text-slate-200/80">
                                                                <li className="flex items-start gap-3">
                                                                        <Users className="mt-1 h-5 w-5 text-cyan-300" aria-hidden="true" />
                                                                        <span>
                                                                                Warm introductions to institutional buyers actively searching for certified safety products.
                                                                        </span>
                                                                </li>
                                                                <li className="flex items-start gap-3">
                                                                        <ShieldCheck className="mt-1 h-5 w-5 text-cyan-300" aria-hidden="true" />
                                                                        <span>
                                                                                Structured compliance reviews that highlight your brand’s quality credentials and instil trust.
                                                                        </span>
                                                                </li>
                                                                <li className="flex items-start gap-3">
                                                                        <ArrowRight className="mt-1 h-5 w-5 text-cyan-300" aria-hidden="true" />
                                                                        <span>
                                                                                Transparent settlements, marketing co-creation, and storytelling templates crafted by Safety Online.
                                                                        </span>
                                                                </li>
                                                        </ul>
                                                        <Button
                                                                asChild
                                                                className="mt-8 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-300"
                                                        >
                                                                <Link href="/seller/register" className="flex items-center justify-center gap-2">
                                                                        Launch your seller journey
                                                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                                </Link>
                                                        </Button>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 py-16" id="testimonials">
                                <div className="flex flex-col gap-4 text-center">
                                        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                                                Safety leaders who trust our marketplace
                                        </h2>
                                        <p className="mx-auto max-w-2xl text-base text-slate-200/80">
                                                We partner with industries that never compromise on wellbeing—construction, renewable energy,
                                                logistics, manufacturing, healthcare, and more.
                                        </p>
                                </div>
                                <div className="mt-10 grid gap-6 md:grid-cols-2">
                                        {testimonials.map((testimonial) => (
                                                <blockquote
                                                        key={testimonial.name}
                                                        className="flex h-full flex-col justify-between rounded-3xl border border-white/5 bg-slate-900/70 p-8 text-left shadow-lg"
                                                >
                                                        <p className="text-lg leading-relaxed text-slate-100">
                                                                “{testimonial.quote}”
                                                        </p>
                                                        <footer className="mt-6">
                                                                <p className="text-sm font-semibold text-cyan-200">{testimonial.name}</p>
                                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                                        {testimonial.role}
                                                                </p>
                                                        </footer>
                                                </blockquote>
                                        ))}
                                </div>
                                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm uppercase tracking-widest text-slate-400">
                                        {partnerBadges.map((partner) => (
                                                <span
                                                        key={partner}
                                                        className="rounded-full border border-white/10 bg-slate-900/50 px-6 py-2"
                                                >
                                                        {partner}
                                                </span>
                                        ))}
                                </div>
                        </section>

                        <section id="cta" className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-500 to-sky-500 py-20">
                                <div className="absolute inset-0 bg-[url('/images/home/Banner.png')] bg-cover bg-center opacity-10" aria-hidden="true" />
                                <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/30 bg-white/10 p-10 text-center text-white backdrop-blur">
                                        <h2 className="text-3xl font-semibold sm:text-4xl">
                                                Ready to elevate safety across every site?
                                        </h2>
                                        <p className="mx-auto mt-4 max-w-2xl text-base text-cyan-50/80">
                                                Let’s curate catalogues, co-create brand stories, and deliver protective gear that inspires trust.
                                                The Safety Online team will get in touch within one business day.
                                        </p>
                                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                                                <Button
                                                        asChild
                                                        size="lg"
                                                        variant="secondary"
                                                        className="bg-white text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
                                                >
                                                        <Link href="/contact" className="flex items-center gap-2">
                                                                Talk to our specialists
                                                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                                        </Link>
                                                </Button>
                                                <Button
                                                        asChild
                                                        size="lg"
                                                        variant="ghost"
                                                        className="border-white/70 bg-transparent text-white hover:bg-white/20"
                                                >
                                                        <Link href="/seller" className="flex items-center gap-2">
                                                                Discover seller programs
                                                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                                        </Link>
                                                </Button>
                                        </div>
                                </div>
                        </section>

                        <footer className="bg-slate-950/95 py-12">
                                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-3">
                                                <Image src={Logo} alt="Safety Online" className="h-9 w-auto" />
                                                <div>
                                                        <p className="font-semibold text-slate-200">Safety Online</p>
                                                        <p className="text-xs text-slate-500">© {new Date().getFullYear()} All rights reserved.</p>
                                                </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-slate-500">
                                                <Link href="/(policies)/privacy-policy" className="hover:text-slate-200">
                                                        Privacy
                                                </Link>
                                                <Link href="/(policies)/terms-conditions" className="hover:text-slate-200">
                                                        Terms
                                                </Link>
                                                <Link href="/(policies)/shipping-policy" className="hover:text-slate-200">
                                                        Shipping
                                                </Link>
                                                <Link href="/(policies)/cancellation-refund-policy" className="hover:text-slate-200">
                                                        Refunds
                                                </Link>
                                        </div>
                                </div>
                        </footer>
                </main>
        );
}
