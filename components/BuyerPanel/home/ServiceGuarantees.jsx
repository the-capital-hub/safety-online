"use client";

import { Truck, ShieldCheck, Headset, RefreshCcw, CreditCard } from "lucide-react";

const services = [
        {
                icon: Truck,
                title: "Lightning Delivery",
                description: "Same-day dispatch for ready stock",
        },
        {
                icon: Headset,
                title: "Account Managers",
                description: "Single point of contact for enterprises",
        },
        {
                icon: ShieldCheck,
                title: "Verified OEMs",
                description: "Only authorised manufacturer partners",
        },
        {
                icon: RefreshCcw,
                title: "Easy Replenishment",
                description: "Automated re-order schedules",
        },
        {
                icon: CreditCard,
                title: "Flexible Payments",
                description: "Net terms &amp; digital payment support",
        },
];

export default function ServiceGuarantees() {
        return (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex flex-col gap-2">
                                <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">
                                        Service promise
                                </span>
                                <h3 className="text-2xl font-semibold text-slate-900">Support built for procurement teams</h3>
                                <p className="text-sm text-slate-600">
                                        We blend digital convenience with human expertise to deliver dependable procurement experiences for safety leaders.
                                </p>
                        </div>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                                {services.map(({ icon: Icon, title, description }) => (
                                        <div key={title} className="group rounded-2xl border border-slate-200/70 bg-white/70 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#f97316]/40 hover:shadow-md">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                                                        <Icon className="h-5 w-5" />
                                                </div>
                                                <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
                                                <p className="mt-2 text-sm text-slate-600">{description}</p>
                                        </div>
                                ))}
                        </div>
                </div>
        );
}
