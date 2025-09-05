"use client";
import { motion } from "framer-motion";
import { GrayHelmet } from "@/public/images/children-helmet/index.js";

const features = [
    { title: "Safe", desc: "Tested to meet ISI standards" },
    { title: "Fun", desc: "Bright colors & characters kids love" },
    { title: "Comfortable", desc: "Cushioned, lightweight, and secure" },
  ];

export default function AboutSection() {
	return (
		<section id="about" className="py-10 overflow-hidden">
			<div className="px-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content - Image */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
					>
						<img
							src={GrayHelmet.src}
							alt="Professional helmet design"
							className="w-auto h-[350px] mx-auto rounded-2xl"
						/>
					</motion.div>

					{/* Right Content */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="space-y-6"
					>
						<div className="space-y-4">
							<h2 className="text-4xl lg:text-6xl font-bold leading-tight">
								About Safety Online
							</h2>

							<h3 className="text-xl font-semibold text-primary">
							Our goal is simple: <b>turn boring safety gear into exciting gear kids choose to wear.</b>
							</h3>
						</div>

						<div className="space-y-4">
						<ul className="space-y-4">
        {features.map((f, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3, duration: 0.6 }}
            className="bg-white shadow rounded-2xl p-4 border-l-4 border-teal-500"
          >
            <p className="font-semibold text-teal-600">{f.title}</p>
            <p className="text-gray-600">{f.desc}</p>
          </motion.li>
        ))}
      </ul>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
