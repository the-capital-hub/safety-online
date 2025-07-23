"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";

export function FeaturedCategoriesSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating featured categories section:", data);
		onUpdate("featuredCategories");
	};

	return (
		<SectionCard
			title="Featured Categories"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Show / Hide"
				checked={data.featuredCategoriesShow}
				onToggle={(checked) => onUpdate("featuredCategoriesShow", checked)}
			/>

			<InputField
				label="Title"
				value={data.featuredCategoriesTitle}
				onChange={(value) => onUpdate("featuredCategoriesTitle", value)}
				id="featured-categories-title"
			/>

			<TextareaField
				label="Featured Categories"
				value={data.featuredCategories}
				onChange={(value) => onUpdate("featuredCategories", value)}
				id="featured-categories"
			/>

			<InputField
				label="Products Limit"
				value={data.productsLimit}
				onChange={(value) => onUpdate("productsLimit", value)}
				id="products-limit"
			/>
		</SectionCard>
	);
}
