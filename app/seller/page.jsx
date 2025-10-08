"use client";
// import Image1 from "@/public/images/seller-panel/home/product-categories/Image1.png";
// import Image2 from "@/public/images/seller-panel/home/product-categories/Image2.png";
// import Image3 from "@/public/images/seller-panel/home/product-categories/Image3.png";
// import Image4 from "@/public/images/seller-panel/home/product-categories/Image4.png";
// import Image5 from "@/public/images/seller-panel/home/product-categories/Image5.png";
// import Image6 from "@/public/images/seller-panel/home/product-categories/Image6.png";
// import avatar1 from "@/public/images/avatar/avatar1.png";
// import avatar2 from "@/public/images/avatar/avatar2.png";
import HeroSection from "@/components/SellerPanel/LandingPage/HeroSection";
import WhySellerChoose from "@/components/SellerPanel/LandingPage/WhySellerChoose";
import SellerJourney from "@/components/SellerPanel/LandingPage/SellerJourney";
import CategoryCard from "@/components/SellerPanel/LandingPage/CategoryCard";
import SellerDashboard from "@/components/SellerPanel/LandingPage/SellerDashboard";
import FAQ from "@/components/SellerPanel/LandingPage/FAQ";
import ReadyToPut from "@/components/SellerPanel/LandingPage/ReadyToPut";

// const categories = [
//         {
//                 name: "Traffic & road control",
//                 description: "Cones, barricades, bollards, and reflective signage.",
//                 image: Image1,
//         },
//         {
//                 name: "Fire safety systems",
//                 description: "Extinguishers, detectors, sprinklers, and cabinets.",
//                 image: Image2,
//         },
//         {
//                 name: "Visibility & apparel",
//                 description: "Reflective jackets, gloves, and protective uniforms.",
//                 image: Image3,
//         },
//         {
//                 name: "Industrial PPE",
//                 description: "Helmets, harnesses, respirators, and impact gear.",
//                 image: Image4,
//         },
//         {
//                 name: "Emergency response",
//                 description: "First-aid kits, stretchers, and evacuation hardware.",
//                 image: Image5,
//         },
//         {
//                 name: "Smart infrastructure",
//                 description: "IoT beacons, speed displays, and traffic analytics.",
//                 image: Image6,
//         },
// ];

// const testimonials = [
//         {
//                 name: "Siddharth Arora",
//                 role: "Founder, SafetyGear India",
//                 quote:
//                         "We went from servicing three states to thirteen with SafeTrade. The verified buyer network changed the pace of our business.",
//                 avatar: avatar1,
//         },
//         {
//                 name: "Ritika Mehra",
//                 role: "Director, FireLine Equipments",
//                 quote:
//                         "Uploading 50+ SKUs took minutes. The merchandising tools and analytics give my team clarity every single day.",
//                 avatar: avatar2,
//         },
// ];

export default function SellerLandingPage() {
      

        return (
                <div className="bg-slate-950 text-slate-100">
                        <HeroSection />
                        <WhySellerChoose />
                        <SellerJourney />
                        <CategoryCard />
                        <SellerDashboard />
                        <FAQ/>
<ReadyToPut/>
                        {/* <section className="border-y border-white/5 bg-slate-900/60 py-20">
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
                        </section> */}

                       

                       
                </div>
        );
}

