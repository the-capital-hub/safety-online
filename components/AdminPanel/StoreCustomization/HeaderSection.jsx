"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function HeaderSection({ data, onUpdate, onFileUpload, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating header section:", data);
		onUpdate("header");
	};

	return (
		<SectionCard title="Header" onUpdate={handleUpdate} isUpdating={isUpdating}>
			<InputField
				label="Header Contacts"
				value={data.headerContacts}
				onChange={(value) => onUpdate("headerContacts", value)}
				id="header-contacts"
			/>

			<InputField
				label="Header Text"
				value={data.headerText}
				onChange={(value) => onUpdate("headerText", value)}
				id="header-text"
			/>

			<InputField
				label="Phone Number"
				value={data.phoneNumber}
				onChange={(value) => onUpdate("phoneNumber", value)}
				id="phone-number"
			/>

			<FileUploadArea
				field="headerLogo"
				label="Header Logo"
				onFileUpload={onFileUpload}
			/>
		</SectionCard>
	);
}
