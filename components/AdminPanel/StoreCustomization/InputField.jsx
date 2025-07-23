"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputField({ label, value, onChange, placeholder, type = "text", id }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
    </div>
  )
}
