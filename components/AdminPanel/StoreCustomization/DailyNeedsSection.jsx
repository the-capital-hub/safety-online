"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function DailyNeedsSection({
	data,
	onUpdate,
	onFileUpload,
	isUpdating,
}) {
	const handleUpdate = () => {
		console.log("Updating daily needs section:", data);
		onUpdate("dailyNeeds");
	};

	return (
		<SectionCard
			title="Get Your Daily Needs"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.dailyNeedsEnabled}
				onToggle={(checked) => onUpdate("dailyNeedsEnabled", checked)}
			/>

			<InputField
				label="Title"
				value={data.dailyNeedsTitle}
				onChange={(value) => onUpdate("dailyNeedsTitle", value)}
				placeholder="Title"
				id="daily-needs-title"
			/>

			<TextareaField
				label="Description"
				value={data.dailyNeedsDescription}
				onChange={(value) => onUpdate("dailyNeedsDescription", value)}
				placeholder="Description"
				id="daily-needs-description"
			/>

			<FileUploadArea
				field="dailyNeedsImageLeft"
				label="Image Left"
				onFileUpload={onFileUpload}
			/>

			<FileUploadArea
				field="dailyNeedsImageRight"
				label="Image Right"
				onFileUpload={onFileUpload}
			/>
		</SectionCard>
	);
}
