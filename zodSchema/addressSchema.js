import { z } from "zod";

export const addressSchema = z.object({
        tag: z.enum(["home", "office", "other"]).default("home"),
        name: z.string().min(1, "Name is required"),
        street: z.string().min(1, "Street address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
	zipCode: z
		.string()
		.min(5, "ZIP code must be 5-6 digits")
		.max(6, "ZIP code must be 5-6 digits")
		.regex(/^\d{5,6}$/, "ZIP code must be 5-6 digits"),
	country: z.string().default("India"),
	isDefault: z.boolean().default(false),
});
