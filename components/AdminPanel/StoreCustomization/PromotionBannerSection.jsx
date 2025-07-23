"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";

export function PromotionBannerSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating promotion banner section:", data);
		onUpdate("promotionBanner");
	};

	return (
		<SectionCard
			title="Promotion Banner"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Show / Hide"
				checked={data.promotionBannerShow}
				onToggle={(checked) => onUpdate("promotionBannerShow", checked)}
			/>

			<InputField
				label="Title"
				value={data.promotionTitle}
				onChange={(value) => onUpdate("promotionTitle", value)}
				id="promotion-title"
			/>

			<TextareaField
				label="Description"
				value={data.promotionDescription}
				onChange={(value) => onUpdate("promotionDescription", value)}
				id="promotion-description"
			/>

			<InputField
				label="Button Name"
				value={data.promotionButtonName}
				onChange={(value) => onUpdate("promotionButtonName", value)}
				id="promotion-button-name"
			/>

			<InputField
				label="Button Link"
				value={data.promotionButtonLink}
				onChange={(value) => onUpdate("promotionButtonLink", value)}
				id="promotion-button-link"
			/>
		</SectionCard>
	);
}
