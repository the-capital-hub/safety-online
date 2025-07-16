"use client";

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { FileUploadArea } from "@/components/AdminPanel/StoreCustomization/FileUploadArea.jsx";

export function FeaturePromoSection({
	data,
	onUpdate,
	onFileUpload,
	isUpdating,
}) {
	const handleUpdate = () => {
		console.log("Updating feature promo section:", data);
		onUpdate("featurePromo");
	};

	return (
		<SectionCard
			title="Feature Promo Section"
			onUpdate={handleUpdate}
			isUpdating={isUpdating}
		>
			<ToggleField
				label="Enable this block"
				checked={data.featurePromoEnabled}
				onToggle={(checked) => onUpdate("featurePromoEnabled", checked)}
			/>

			<InputField
				label="Free Shipping"
				value={data.freeShipping}
				onChange={(value) => onUpdate("freeShipping", value)}
				placeholder="Free Shipping"
				id="free-shipping"
			/>

			<InputField
				label="Support"
				value={data.support}
				onChange={(value) => onUpdate("support", value)}
				placeholder="Support"
				id="support"
			/>

			<InputField
				label="Secure Payment"
				value={data.securePayment}
				onChange={(value) => onUpdate("securePayment", value)}
				placeholder="Secure Payment"
				id="secure-payment"
			/>

			<InputField
				label="Latest Offer"
				value={data.latestOffer}
				onChange={(value) => onUpdate("latestOffer", value)}
				placeholder="Latest Offer"
				id="latest-offer"
			/>

			<FileUploadArea
				field="button1Image"
				label="Button 1 Image"
				onFileUpload={onFileUpload}
			/>

			<InputField
				label="Button 1 Link"
				value={data.button1Link}
				onChange={(value) => onUpdate("button1Link", value)}
				placeholder="Button Link"
				id="button-1-link"
			/>

			<FileUploadArea
				field="button2Image"
				label="Button 2 Image"
				onFileUpload={onFileUpload}
			/>

			<InputField
				label="Button 2 Link"
				value={data.button2Link}
				onChange={(value) => onUpdate("button2Link", value)}
				placeholder="Button 2 Link"
				id="button-2-link"
			/>
		</SectionCard>
	);
}
