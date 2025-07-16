"use client";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function SliderSection({ data, onUpdate, onFileUpload, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating slider section:", data);
		onUpdate("slider");
	};

	return (
		<SectionCard
			title="Main Slider"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<div className="flex gap-2 mb-4">
				{[1, 2, 3, 4, 5].map((num) => (
					<Button key={num} variant="outline" size="sm">
						Slider {num}
					</Button>
				))}
			</div>

			<FileUploadArea
				field="sliderImages"
				label="Slider Images"
				onFileUpload={onFileUpload}
			/>

			<InputField
				label="Slider Title"
				value={data.sliderTitle}
				onChange={(value) => onUpdate("sliderTitle", value)}
				placeholder="Slider Title"
				id="slider-title"
			/>

			<TextareaField
				label="Slider Description"
				value={data.sliderDescription}
				onChange={(value) => onUpdate("sliderDescription", value)}
				placeholder="Slider Description"
				id="slider-description"
			/>

			<InputField
				label="Slider Button Name"
				value={data.sliderButtonName}
				onChange={(value) => onUpdate("sliderButtonName", value)}
				placeholder="Slider Button Name"
				id="slider-button-name"
			/>

			<InputField
				label="Slider Button Link"
				value={data.sliderButtonLink}
				onChange={(value) => onUpdate("sliderButtonLink", value)}
				placeholder="Slider Button Link"
				id="slider-button-link"
			/>
		</SectionCard>
	);
}
