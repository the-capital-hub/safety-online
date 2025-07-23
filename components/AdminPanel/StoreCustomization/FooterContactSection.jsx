"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";

export function FooterContactSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating footer contact section:", data);
		onUpdate("footerContact");
	};

	return (
		<SectionCard
			title="Footer Bottom Contact Number"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.footerContactEnabled}
				onToggle={(checked) => onUpdate("footerContactEnabled", checked)}
			/>

			<InputField
				label="Footer Bottom Contact Number"
				value={data.footerContactNumber}
				onChange={(value) => onUpdate("footerContactNumber", value)}
				placeholder="Footer Bottom Contact Number"
				id="footer-contact-number"
			/>
		</SectionCard>
	);
}
