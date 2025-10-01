"use client";

import { Truck, ShieldCheck, PhoneCall, MailCheck, Clock4 } from "lucide-react";

const supportItems = [
        {
                icon: Truck,
                title: "Pan-India Fulfilment",
                description: "14 distribution hubs for quick delivery",
        },
        {
                icon: PhoneCall,
                title: "Dedicated Consultants",
                description: "+91 9945234161 | 9am - 8pm",
        },
        {
                icon: MailCheck,
                title: "RFQ Support",
                description: "help@safetyonline.in",
        },
        {
                icon: ShieldCheck,
                title: "100% Genuine Products",
                description: "Backed by OEM warranties",
        },
        {
                icon: Clock4,
                title: "24/7 Emergency Desk",
                description: "Rapid response for critical requirements",
        },
];

export default function SupportSection() {
        return (
                <section className="relative overflow-hidden bg-slate-900 py-16 text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.35),_transparent_60%)]" aria-hidden />
                        <div className="relative mx-auto max-w-7xl px-6">
                                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="max-w-2xl space-y-4">
                                                <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]">
                                                        Partner-first service
                                                </span>
                                                <h2 className="text-3xl font-bold sm:text-4xl">We stay with you beyond the purchase</h2>
                                                <p className="text-base text-slate-200">
                                                        From procurement to deployment and re-ordering, our specialists ensure hassle-free operations for factories, construction sites and corporate workplaces across India.
                                                </p>
                                        </div>
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#facc15]">Assistance</p>
                                                <p className="mt-2 text-lg font-semibold text-white">Need a tailored quote?</p>
                                                <p className="mt-1 text-sm text-slate-200">Share your requirement and we&apos;ll respond within 1 business hour.</p>
                                                <a
                                                        href="mailto:help@safetyonline.in"
                                                        className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                                                >
                                                        Write to us
                                                </a>
                                        </div>
                                </div>

                                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                        {supportItems.map(({ icon: Icon, title, description }) => (
                                                <div
                                                        key={title}
                                                        className="group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                                                >
                                                        <div>
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316]/20 text-[#facc15]">
                                                                        <Icon className="h-5 w-5" />
                                                                </div>
                                                                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                                                                <p className="mt-2 text-sm text-slate-200">{description}</p>
                                                        </div>
                                                        <span className="mt-6 text-xs font-semibold uppercase tracking-[0.4em] text-[#facc15]/70">Always on</span>
                                                </div>
                                        ))}
                                </div>
                        </div>
                </section>
        );
}
