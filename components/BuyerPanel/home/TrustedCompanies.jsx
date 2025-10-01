"use client";

const companyLogos = ["3M", "Honeywell", "Ansell", "Udyogi", "Karam", "Allen Cooper", "Safari", "Dräger", "Hillson", "Voltas Beko"];

export default function TrustedCompanies() {
        return (
                <section className="bg-[#fff7ed] py-12">
                        <div className="mx-auto max-w-7xl px-6">
                                <div className="rounded-3xl border border-[#fed7aa] bg-white/70 p-8 shadow-sm backdrop-blur">
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">Trusted by 2,500+ enterprises</p>
                                                        <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Supplying safety gear to leading Indian brands</h2>
                                                </div>
                                                <p className="max-w-xl text-sm text-slate-600">
                                                        From automotive manufacturing and logistics to facility management and infrastructure projects, SafetyOnline powers procurement for India&apos;s fastest growing organisations.
                                                </p>
                                        </div>
                                        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                                {companyLogos.map((logo) => (
                                                        <div
                                                                key={logo}
                                                                className="flex h-24 items-center justify-center rounded-2xl border border-[#fed7aa]/80 bg-white text-base font-semibold text-[#ea580c] shadow-sm transition hover:-translate-y-1 hover:border-[#f97316]"
                                                        >
                                                                {logo}
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
