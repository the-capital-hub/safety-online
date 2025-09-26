import { z } from "zod";

export const phoneRegex = /^[0-9]{7,15}$/;
export const pincodeRegex = /^[0-9]{4,10}$/;
export const gstinRegex = /^[0-9A-Z]{8,20}$/i;

export const addressSchema = z.object({
	tagName: z.string().min(2, "Tag name is required"),
	building: z.string().min(1, "Building is required"),
	street: z.string().min(1, "Street is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	pincode: z.string().regex(pincodeRegex, "Enter a valid pincode"),
	country: z.string().min(2, "Country is required"),
});

export const companyBaseSchema = z.object({
	companyName: z.string().min(2, "Company name is required"),
	companyEmail: z.string().email("Enter a valid email"),
	phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
	gstinNumber: z
		.string()
		.regex(gstinRegex, "Enter a valid GSTIN")
		.optional()
		.or(z.literal("")),
	companyLogo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
});

export const companyCreateSchema = companyBaseSchema.extend({
	// addresses optional at creation time
	companyAddress: z.array(addressSchema).optional(),
});

export const companyUpdateSchema = companyBaseSchema.partial().extend({
	companyAddress: z.array(addressSchema).optional(),
});
