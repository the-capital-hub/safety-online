"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";

export function MenuSection({ data, onUpdate, onMenuItemToggle, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating menu section:", data);
		onUpdate("menu");
	};

	return (
		<SectionCard title="Menu" onUpdate={handleUpdate} isUpdating={isUpdating}>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{Object.entries(data.menuItems).map(([key, value]) => (
					<ToggleField
						key={key}
						label={key
							.replace(/([A-Z])/g, " $1")
							.trim()
							.replace(/^\w/, (c) => c.toUpperCase())}
						checked={value}
						onToggle={(checked) => onMenuItemToggle(key, checked)}
					/>
				))}
			</div>
		</SectionCard>
	);
}
