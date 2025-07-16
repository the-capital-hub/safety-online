"use client"

import { SectionCard } from "@/components/AdminPanel/StoreCustomization/SectionCard.jsx";
import { ToggleField } from "@/components/AdminPanel/StoreCustomization/ToggleField.jsx";
import { InputField } from "@/components/AdminPanel/StoreCustomization/InputField.jsx";

export function DiscountCouponSection({ data, onUpdate, isUpdating }) {
  const handleUpdate = () => {
    console.log("Updating discount coupon section:", data)
    onUpdate("discountCoupon")
  }

  return (
    <SectionCard title="Discount Coupon Code Box" onUpdate={handleUpdate} isUpdating={isUpdating}>
      <ToggleField
        label="Show / Hide"
        checked={data.discountCouponShow}
        onToggle={(checked) => onUpdate("discountCouponShow", checked)}
      />

      <InputField
        label="Home Page Discount Title"
        value={data.discountTitle}
        onChange={(value) => onUpdate("discountTitle", value)}
        id="discount-title"
      />

      <InputField
        label="Super Discount Active Coupon Code"
        value={data.discountCode}
        onChange={(value) => onUpdate("discountCode", value)}
        id="discount-code"
      />
    </SectionCard>
  )
}
