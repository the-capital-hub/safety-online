"use client"

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";
import { TextareaField } from "@/components/AdminPanel/StoreCustomization/TextareaField.jsx";

export function LatestDiscountedProductsSection({ data, onUpdate, isUpdating }) {
  const handleUpdate = () => {
    console.log("Updating latest discounted products section:", data)
    onUpdate("latestDiscountedProducts")
  }

  return (
    <SectionCard title="Latest Discounted Products" onUpdate={handleUpdate} isUpdating={isUpdating}>
      <ToggleField
        label="Enable this block"
        checked={data.latestDiscountedProductsEnabled}
        onToggle={(checked) => onUpdate("latestDiscountedProductsEnabled", checked)}
      />

      <InputField
        label="Title"
        value={data.latestDiscountedProductsTitle}
        onChange={(value) => onUpdate("latestDiscountedProductsTitle", value)}
        placeholder="Title"
        id="latest-discounted-products-title"
      />

      <TextareaField
        label="Description"
        value={data.latestDiscountedProductsDescription}
        onChange={(value) => onUpdate("latestDiscountedProductsDescription", value)}
        placeholder="Description"
        id="latest-discounted-products-description"
      />

      <InputField
        label="Products Limit"
        value={data.latestDiscountedProductsLimit}
        onChange={(value) => onUpdate("latestDiscountedProductsLimit", value)}
        placeholder="0"
        id="latest-discounted-products-limit"
      />
    </SectionCard>
  )
}
