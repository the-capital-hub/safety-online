"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";

export function FooterSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating footer section:", data);
		onUpdate("footer");
	};

	return (
		<SectionCard
			title="Footer - Block 1"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.footerBlock1Enabled}
				onToggle={(checked) => onUpdate("footerBlock1Enabled", checked)}
			/>

			<InputField
				label="Title"
				value={data.footerBlock1Title}
				onChange={(value) => onUpdate("footerBlock1Title", value)}
				placeholder="Title"
				id="footer-block1-title"
			/>

			<InputField
				label="Link 1"
				value={data.footerBlock1Link1}
				onChange={(value) => onUpdate("footerBlock1Link1", value)}
				placeholder="About Us"
				id="footer-block1-link1"
			/>

			<InputField
				label="Link 2"
				value={data.footerBlock1Link2}
				onChange={(value) => onUpdate("footerBlock1Link2", value)}
				placeholder="Contact Us"
				id="footer-block1-link2"
			/>

			<InputField
				label="Link 3"
				value={data.footerBlock1Link3}
				onChange={(value) => onUpdate("footerBlock1Link3", value)}
				placeholder="Careers"
				id="footer-block1-link3"
			/>

			<InputField
				label="Link 4"
				value={data.footerBlock1Link4}
				onChange={(value) => onUpdate("footerBlock1Link4", value)}
				placeholder="News"
				id="footer-block1-link4"
			/>
		</SectionCard>
	);
}
