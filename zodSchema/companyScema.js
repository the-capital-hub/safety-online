import { z } from "zod";

export const phoneRegex = /^[0-9]{7,15}$/;
export const pincodeRegex = /^[0-9]{4,10}$/;
export const gstinRegex = /^[0-9A-Z]{8,20}$/i;
export const accountNumberRegex = /^[0-9]{6,20}$/;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
export const upiRegex = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;

export const addressSchema = z.object({
	tagName: z.string().min(2, "Tag name is required"),
	building: z.string().min(1, "Building is required"),
	street: z.string().min(1, "Street is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	pincode: z.string().regex(pincodeRegex, "Enter a valid pincode"),
	country: z.string().min(2, "Country is required"),
});

export const bankDetailsBaseSchema = z.object({
        accountHolderName: z.string().min(3, "Account holder name is required"),
        accountNumber: z.string().regex(accountNumberRegex, "Enter a valid account number"),
        ifscCode: z
                .string()
                .regex(ifscRegex, "Enter a valid IFSC code")
                .transform((value) => value.toUpperCase()),
        bankName: z.string().min(2, "Bank name is required"),
        branchName: z
                .string()
                .min(2, "Branch name should be at least 2 characters")
                .optional()
                .or(z.literal("")),
        accountType: z
                .enum(["savings", "current", "overdraft", "cash_credit"])
                .optional()
                .or(z.literal("")),
        upiId: z
                .string()
                .regex(upiRegex, "Enter a valid UPI ID")
                .optional()
                .or(z.literal("")),
});

export const companyBaseSchema = z.object({
        companyName: z.string().min(2, "Company name is required"),
        companyEmail: z.string().email("Enter a valid email"),
        phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
        brandName: z
                .string()
                .min(2, "Brand name should be at least 2 characters")
                .optional()
                .or(z.literal("")),
        brandDescription: z
                .string()
                .max(500, "Brand description should be under 500 characters")
                .optional()
                .or(z.literal("")),
        gstinNumber: z
                .string()
                .regex(gstinRegex, "Enter a valid GSTIN")
                .optional()
                .or(z.literal("")),
        companyLogo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
        bankDetails: bankDetailsBaseSchema.partial().optional(),
});

export const companyCreateSchema = companyBaseSchema.extend({
	// addresses optional at creation time
	companyAddress: z.array(addressSchema).optional(),
});

export const companyUpdateSchema = companyBaseSchema.partial().extend({
        companyAddress: z.array(addressSchema).optional(),
        bankDetails: bankDetailsBaseSchema.partial().optional(),
});

export const bankDetailsSchema = bankDetailsBaseSchema;
