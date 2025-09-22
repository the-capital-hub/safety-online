"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { companyInfo } from "@/constants/companyInfo";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactPageView() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactPoints = [
    {
      icon: Phone,
      title: "Call our specialists",
      value: companyInfo.phone,
      href: `tel:${companyInfo.phone.replace(/[^+\d]/g, "")}`,
      description: "Talk to our safety consultants for immediate assistance.",
    },
    {
      icon: Mail,
      title: "Email our team",
      value: companyInfo.email,
      href: `mailto:${companyInfo.email}`,
      description: "Share briefs, documents or RFQs and we'll reply promptly.",
    },
  ];

  const highlights = [
    "Dedicated key account management for enterprises",
    "Personalised safety audits and compliance guidance",
    "Pan-India delivery with assured quality benchmarks",
  ];

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!formValues.firstName.trim()) {
      toast.error("Please share your first name.");
      return;
    }

    if (!formValues.email.trim()) {
      toast.error("We need your email to get back to you.");
      return;
    }

    if (!formValues.phone.trim()) {
      toast.error("A contact number helps us reach you faster.");
      return;
    }

    if (!formValues.message.trim() || formValues.message.trim().length < 10) {
      toast.error("Tell us a little more about how we can help.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send your message right now.");
      }

      toast.success(data.message || "Message sent successfully!");
      setFormValues(INITIAL_FORM);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#FFFCE0] via-white to-[#FDF3A3]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/3 h-56 w-56 rounded-full bg-yellow-300/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute top-24 left-6 hidden h-32 w-32 rotate-6 rounded-3xl border border-yellow-300/50 bg-yellow-200/30 shadow-lg lg:block" />
      </div>

      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-black/5 px-5 py-2 text-sm font-medium uppercase tracking-[0.3em] text-black/70">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Contact Safety Online
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
                Let's build safer environments together
              </h1>
              <p className="text-lg text-black/70 lg:text-xl">
                Whether you need product recommendations, compliance guidance, or a strategic sourcing partner, our specialists are here to support you across every stage of your safety journey.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-white/80 p-4 text-sm text-black/70 shadow-sm backdrop-blur"
                >
                  <ShieldCheck className="mt-1 h-5 w-5 text-yellow-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr,1.25fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-black to-[#1F1A17] p-8 text-white shadow-2xl sm:p-10">
            <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full bg-yellow-400/40 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-yellow-300/20 blur-3xl" />

            <div className="relative flex flex-col gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/20 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-yellow-200">
                  We're ready to help
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/20 text-yellow-300">
                    <Image
                      src={companyInfo.logo}
                      alt={`${companyInfo.name} logo`}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-yellow-200/80">
                      Safety Online
                    </p>
                    <h2 className="text-2xl font-semibold text-white">Contact Information</h2>
                  </div>
                </div>
                <p className="text-base text-white/70">
                  Say hello to our team for tailored product suggestions, enterprise pricing, or on-site safety audits. We're just a call or message away.
                </p>
              </div>

              <div className="space-y-6">
                {contactPoints.map(({ icon: Icon, title, value, description, href }) => (
                  <div
                    key={title}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-yellow-400/60 hover:bg-yellow-400/10"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm uppercase tracking-widest text-yellow-200/70">{title}</p>
                      <a
                        href={href}
                        className="flex items-center gap-2 text-lg font-semibold text-white transition-colors hover:text-yellow-300"
                      >
                        {value}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                      <p className="text-sm text-white/60">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-300">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-widest text-yellow-200/70">
                      Visit our experience centre
                    </p>
                    <p className="text-lg font-semibold text-white">Bengaluru Headquarters</p>
                    <p className="text-sm leading-relaxed text-white/60">
                      {companyInfo.address.map((line, index) => (
                        <span key={`${line}-${index}`} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white/70">
                  <Clock className="h-4 w-4 text-yellow-300" />
                  Monday – Saturday · 9:30 AM to 6:30 PM IST
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-yellow-200/70 bg-white/90 shadow-[0_18px_45px_rgba(17,24,39,0.12)] backdrop-blur">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-yellow-200/60 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-black/5 blur-3xl" />
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8 p-8 sm:p-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-black/60">
                  Share your requirements
                </p>
                <h3 className="text-2xl font-semibold text-black">
                  Complete the form & we'll respond within 24 hours
                </h3>
                <p className="text-sm text-black/60">
                  Provide as much detail as possible so the right expert can connect with you quickly.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70" htmlFor="firstName">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    value={formValues.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="Priya"
                    className="h-12 rounded-xl border border-black/10 bg-white/90 px-4 text-base shadow-sm focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70" htmlFor="lastName">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    value={formValues.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Sharma"
                    className="h-12 rounded-xl border border-black/10 bg-white/90 px-4 text-base shadow-sm focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70" htmlFor="email">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange("email")}
                    placeholder="you@safetyteam.com"
                    className="h-12 rounded-xl border border-black/10 bg-white/90 px-4 text-base shadow-sm focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black/70" htmlFor="phone">
                    Phone number
                  </label>
                  <Input
                    id="phone"
                    value={formValues.phone}
                    onChange={handleChange("phone")}
                    placeholder="+91 98765 43210"
                    className="h-12 rounded-xl border border-black/10 bg-white/90 px-4 text-base shadow-sm focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-black/70" htmlFor="message">
                  How can we support you?
                </label>
                <Textarea
                  id="message"
                  value={formValues.message}
                  onChange={handleChange("message")}
                  placeholder="Share your requirement, budget or project timelines..."
                  className="min-h-[150px] rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-base shadow-sm focus-visible:border-yellow-400 focus-visible:ring-yellow-400"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-full bg-black px-6 py-3 text-lg font-semibold text-yellow-300 shadow-[0_14px_40px_rgba(0,0,0,0.25)] transition-transform focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-yellow-400/30 to-yellow-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Button>

              <p className="text-center text-xs text-black/50">
                By submitting, you agree to let Safety Online contact you with relevant information about our solutions.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
