"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";

export function PopularProductsSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating popular products section:", data);
		onUpdate("popularProducts");
	};

	return (
		<SectionCard
			title="Popular Products"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Show / Hide"
				checked={data.popularProductsShow}
				onToggle={(checked) => onUpdate("popularProductsShow", checked)}
			/>

			<InputField
				label="Title"
				value={data.popularProductsTitle}
				onChange={(value) => onUpdate("popularProductsTitle", value)}
				id="popular-products-title"
			/>

			<TextareaField
				label="Description"
				value={data.popularProductsDescription}
				onChange={(value) => onUpdate("popularProductsDescription", value)}
				id="popular-products-description"
			/>

			<InputField
				label="Products Limit"
				value={data.popularProductsLimit}
				onChange={(value) => onUpdate("popularProductsLimit", value)}
				id="popular-products-limit"
			/>
		</SectionCard>
	);
}
