"use client";

import { Button } from "@/components/ui/button";
import { useProductStore } from "@/lib/store";

export default function CategoryNav() {
	const { currentCategory, setCurrentCategory } = useProductStore();

	const categories = [
		{ id: "all", label: "All", icon: "🛡️" },
		{ id: "personal-safety", label: "Personal Safety", icon: "👷" },
		{ id: "road-safety", label: "Road Safety", icon: "🚧" },
		{ id: "industrial-safety", label: "Industrial Safety", icon: "🏭" },
		{ id: "fire-safety", label: "Fire Safety", icon: "🔥" },
		{ id: "first-aid", label: "First Aid", icon: "🏥" },
	];

	return (
		<div className="bg-white rounded-lg p-6 shadow-sm">
			<div className="flex flex-wrap gap-2">
				{categories.map((category) => (
					<Button
						key={category.id}
						variant={currentCategory === category.id ? "default" : "outline"}
						className={`${
							currentCategory === category.id
								? "bg-black text-white"
								: "hover:bg-gray-100"
						}`}
						onClick={() => setCurrentCategory(category.id)}
					>
						<span className="mr-2">{category.icon}</span>
						{category.label}
					</Button>
				))}
			</div>
		</div>
	);
}
