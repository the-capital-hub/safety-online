"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function QuickDeliverySection({
	data,
	onUpdate,
	onFileUpload,
	isUpdating,
}) {
	const handleUpdate = () => {
		console.log("Updating quick delivery section:", data);
		onUpdate("quickDelivery");
	};

	return (
		<SectionCard
			title="Quick Delivery Section"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.quickDeliveryEnabled}
				onToggle={(checked) => onUpdate("quickDeliveryEnabled", checked)}
			/>

			<InputField
				label="Sub Title"
				value={data.quickDeliverySubTitle}
				onChange={(value) => onUpdate("quickDeliverySubTitle", value)}
				placeholder="Sub Title"
				id="quick-delivery-sub-title"
			/>

			<InputField
				label="Title"
				value={data.quickDeliveryTitle}
				onChange={(value) => onUpdate("quickDeliveryTitle", value)}
				placeholder="Title"
				id="quick-delivery-title"
			/>

			<TextareaField
				label="Description"
				value={data.quickDeliveryDescription}
				onChange={(value) => onUpdate("quickDeliveryDescription", value)}
				placeholder="Description"
				id="quick-delivery-description"
			/>

			<InputField
				label="Button Name"
				value={data.quickDeliveryButtonName}
				onChange={(value) => onUpdate("quickDeliveryButtonName", value)}
				placeholder="Button Name"
				id="quick-delivery-button-name"
			/>

			<InputField
				label="Button Link"
				value={data.quickDeliveryButtonLink}
				onChange={(value) => onUpdate("quickDeliveryButtonLink", value)}
				placeholder="Button Link"
				id="quick-delivery-button-link"
			/>

			<FileUploadArea
				field="quickDeliveryImages"
				label="Images"
				onFileUpload={onFileUpload}
			/>
		</SectionCard>
	);
}
