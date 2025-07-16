"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";

export function SocialLinksSection({ data, onUpdate, isUpdating }) {
	const handleUpdate = () => {
		console.log("Updating social links section:", data);
		onUpdate("socialLinks");
	};

	return (
		<SectionCard
			title="Social Links"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.socialLinksEnabled}
				onToggle={(checked) => onUpdate("socialLinksEnabled", checked)}
			/>

			<InputField
				label="Facebook"
				value={data.facebookLink}
				onChange={(value) => onUpdate("facebookLink", value)}
				placeholder="Facebook"
				id="facebook-link"
			/>

			<InputField
				label="Twitter"
				value={data.twitterLink}
				onChange={(value) => onUpdate("twitterLink", value)}
				placeholder="Twitter"
				id="twitter-link"
			/>

			<InputField
				label="Pinterest"
				value={data.pinterestLink}
				onChange={(value) => onUpdate("pinterestLink", value)}
				placeholder="Pinterest"
				id="pinterest-link"
			/>

			<InputField
				label="LinkedIn"
				value={data.linkedinLink}
				onChange={(value) => onUpdate("linkedinLink", value)}
				placeholder="LinkedIn"
				id="linkedin-link"
			/>

			<InputField
				label="WhatsApp"
				value={data.whatsappLink}
				onChange={(value) => onUpdate("whatsappLink", value)}
				placeholder="WhatsApp"
				id="whatsapp-link"
			/>
		</SectionCard>
	);
}
