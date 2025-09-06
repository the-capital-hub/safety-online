"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.jsx";
import {
  PinkHelmet,
  YellowHelmet,
} from "@/public/images/children-helmet/index.js";

export default function ProductShowcase() {
  const products = [
    {
      name: "Brave Blue Rider",
      price: "₹ 4,999",
      image: YellowHelmet.src,
      description:
        "This helmet is perfect for young adventurers who love speed and outdoor fun. With its bold blue design, the Brave Blue Rider keeps your child safe while looking like a little superhero on wheels.",
      size: "Available in Small (3–6 yrs) & Medium (7–12 yrs)",
      btnContent: "Buy Brave Blue Rider Now",
    },
    {
      name: "Pretty Pink Explorer",
      price: "₹ 4,999",
      image: PinkHelmet.src,
      description:
        "Made for little dreamers and explorers, this pink helmet adds charm to every ride. The Pretty Pink Explorer makes cycling safe, colorful, and exciting – a helmet your child will never want to take off.",
      size: "Available in Small (3–6 yrs) & Medium (7–12 yrs)",
      btnContent: "Buy Pretty Pink Explorer Now",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-purple-100 to-pink-100">
      <div className="px-6 max-w-6xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose The Best Helmet
          </h2>
          <p className="max-w-2xl mx-auto text-lg">
            Meet India’s most lovable kids’ bike helmets – Brave Blue Rider & Pretty Pink Explorer.
            Safe. Stylish. Super fun to wear!
          </p>
        </motion.div>

        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 !== 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Helmet Image */}
            <div className="flex-1 flex justify-center">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-72 h-72 object-contain"
              />
            </div>

            {/* Helmet Details */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <h3 className="text-2xl font-bold">{product.name}</h3>
              <div className="text-xl font-bold text-amber-700">{product.price}</div>
              <p className="text-base text-gray-700">{product.description}</p>
              <p className="text-sm text-gray-500">{product.size}</p>

              <Button className="bg-amber-700 hover:bg-amber-800 mt-4 rounded-full">
                {product.btnContent}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
