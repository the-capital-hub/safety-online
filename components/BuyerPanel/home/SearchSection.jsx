"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchSection({ searchQuery, setSearchQuery }) {
	const handleSearch = (e) => {
		e.preventDefault();
		// Search functionality is handled by the parent component
	};

	return (
		<section className="py-8 md:py-16 bg-white">
			<div className="px-10 text-center">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-2xl md:text-3xl font-bold mb-4"
				>
					Search
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base"
				>
					Use this section to help customers find the products they're looking
					for.
				</motion.p>
				<motion.form
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					onSubmit={handleSearch}
					className="max-w-md mx-auto relative"
				>
                                                <Input
                                                name="searchQuery"
                                                placeholder="Search products..."
						className="h-10 pr-12 py-3 rounded-full bg-[#EEEEEE66]"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Button
						type="submit"
						size="icon"
						className="absolute right-0.5 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 rounded-full"
					>
						<Search className="h-4 w-4" />
					</Button>
				</motion.form>
			</div>
		</section>
	);
}
