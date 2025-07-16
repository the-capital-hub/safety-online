"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function PaymentMethodSection({
	data,
	onUpdate,
	onFileUpload,
	isUpdating,
}) {
	const handleUpdate = () => {
		console.log("Updating payment method section:", data);
		onUpdate("paymentMethod");
	};

	return (
		<SectionCard
			title="Payment Method"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.paymentMethodEnabled}
				onToggle={(checked) => onUpdate("paymentMethodEnabled", checked)}
			/>

			<FileUploadArea
				field="paymentMethodImage"
				label="Payment Method"
				onFileUpload={onFileUpload}
			/>
		</SectionCard>
	);
}
