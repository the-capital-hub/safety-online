"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";

export function FooterBlock2Section({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating footer block 2 section:", data);
		onUpdate("footerBlock2");
	};

	return (
		<SectionCard
			title="Footer - Block 2"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.footerBlock2Enabled}
				onToggle={(checked) => onUpdate("footerBlock2Enabled", checked)}
			/>

			<InputField
				label="Title"
				value={data.footerBlock2Title}
				onChange={(value) => onUpdate("footerBlock2Title", value)}
				placeholder="Title"
				id="footer-block2-title"
			/>

			<InputField
				label="Link 1"
				value={data.footerBlock2Link1}
				onChange={(value) => onUpdate("footerBlock2Link1", value)}
				placeholder="About Us"
				id="footer-block2-link1"
			/>

			<InputField
				label="Link 2"
				value={data.footerBlock2Link2}
				onChange={(value) => onUpdate("footerBlock2Link2", value)}
				placeholder="Contact Us"
				id="footer-block2-link2"
			/>

			<InputField
				label="Link 3"
				value={data.footerBlock2Link3}
				onChange={(value) => onUpdate("footerBlock2Link3", value)}
				placeholder="Careers"
				id="footer-block2-link3"
			/>

			<InputField
				label="Link 4"
				value={data.footerBlock2Link4}
				onChange={(value) => onUpdate("footerBlock2Link4", value)}
				placeholder="News"
				id="footer-block2-link4"
			/>
		</SectionCard>
	);
}
