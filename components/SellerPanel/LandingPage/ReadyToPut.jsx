import { ArrowRight } from 'lucide-react'
import { Montserrat, Outfit } from 'next/font/google';
import Link from 'next/link'
import React from 'react'

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

const ReadyToPut = () => {
  return (
    <div>

 <section className="relative overflow-hidden py-20">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-300/20 via-amber-400/20 to-amber-200/10" />
                                <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-16 text-center shadow-xl shadow-amber-300/20 backdrop-blur sm:px-12">
                                        <h2 className={`${outfit.className} text-3xl font-semibold text-white max-w-xl`}>
                                                Ready to put safety products in front of serious buyers?
                                        </h2>
                                        <p className={`${mont.className} max-w-2xl text-base text-slate-200/80`}>
                                                Join SafeTrade today and unlock institutional demand, transparent payments, and analytics tuned for the safety economy.
                                        </p>
                                        <div className={`${mont.className} flex flex-col gap-3 md:flex-row`}>
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
  )
}

export default ReadyToPut