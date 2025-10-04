import { z } from "zod";
import { addressSchema, companyCreateSchema, phoneRegex } from "./companyScema.js";

const indianMobileRegex = phoneRegex;

export const sellerPersonalDetailsSchema = z.object({
        firstName: z
                .string({ required_error: "First name is required" })
                .trim()
                .min(1, "First name is required"),
        lastName: z
                .string({ required_error: "Last name is required" })
                .trim()
                .min(1, "Last name is required"),
        email: z
                .string({ required_error: "Email is required" })
                .trim()
                .email("Enter a valid email"),
        mobile: z
                .string({ required_error: "Mobile number is required" })
                .trim()
                .regex(indianMobileRegex, "Enter a valid mobile number"),
        password: z
                .string({ required_error: "Password is required" })
                .min(8, "Password must be at least 8 characters"),
});

export const sellerPersonalDetailsFormSchema = sellerPersonalDetailsSchema.extend({
        confirmPassword: z
                .string({ required_error: "Confirm your password" })
                .min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
});

export const sellerCompanyDetailsSchema = companyCreateSchema;

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const accountNumberRegex = /^\d{9,18}$/;

export const sellerBankDetailsSchema = z.object({
        accountHolderName: z
                .string({ required_error: "Account holder name is required" })
                .trim()
                .min(2, "Account holder name must be at least 2 characters"),
        accountNumber: z
                .string({ required_error: "Account number is required" })
                .trim()
                .regex(accountNumberRegex, "Enter a valid account number"),
        ifscCode: z
                .string({ required_error: "IFSC code is required" })
                .trim()
                .toUpperCase()
                .regex(ifscRegex, "Enter a valid IFSC code"),
        bankName: z
                .string({ required_error: "Bank name is required" })
                .trim()
                .min(2, "Bank name is required"),
        branchName: z
                .string({ required_error: "Branch name is required" })
                .trim()
                .min(2, "Branch name is required"),
});

export const sellerBankDetailsFormSchema = sellerBankDetailsSchema.extend({
        confirmAccountNumber: z
                .string({ required_error: "Confirm your account number" })
                .trim()
                .regex(accountNumberRegex, "Enter a valid account number"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
        message: "Account numbers do not match",
        path: ["confirmAccountNumber"],
});

export const sellerRegistrationSchema = z.object({
        personalDetails: sellerPersonalDetailsSchema,
        companyDetails: sellerCompanyDetailsSchema,
        bankDetails: sellerBankDetailsSchema,
});

export const mapFormToRegistrationPayload = ({
        personalDetails,
        companyDetails,
        bankDetails,
}) => {
        const normalizedAddresses = normalizeCompanyAddressInput(
                companyDetails.companyAddress
        );
        const mappedCompany = { ...companyDetails };
        if (normalizedAddresses.length === 0) {
                delete mappedCompany.companyAddress;
        } else {
                mappedCompany.companyAddress = normalizedAddresses;
        }

        return {
                personalDetails: {
                        firstName: personalDetails.firstName.trim(),
                        lastName: personalDetails.lastName.trim(),
                        email: personalDetails.email.trim().toLowerCase(),
                        mobile: personalDetails.mobile.trim(),
                        password: personalDetails.password,
                },
                companyDetails: {
                        ...mappedCompany,
                        companyName: companyDetails.companyName.trim(),
                        companyEmail: companyDetails.companyEmail.trim().toLowerCase(),
                        phone: companyDetails.phone.trim(),
                        brandName: (companyDetails.brandName || "").trim(),
                        brandDescription: (companyDetails.brandDescription || "").trim(),
                        gstinNumber: (companyDetails.gstinNumber || "").trim().toUpperCase(),
                        companyLogo: (companyDetails.companyLogo || "").trim(),
                },
                bankDetails: {
                        accountHolderName: bankDetails.accountHolderName.trim(),
                        accountNumber: bankDetails.accountNumber.trim(),
                        ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
                        bankName: bankDetails.bankName.trim(),
                        branchName: bankDetails.branchName.trim(),
                },
        };
};

export const emptyCompanyAddress = () => ({
        tagName: "Head Office",
        building: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
});

export const normalizeCompanyAddressInput = (address) => {
        if (!address) return [];
        if (Array.isArray(address)) {
                return address
                        .map((entry) => normalizeCompanyAddressInput(entry)[0])
                        .filter(Boolean);
        }
        const values = Object.values(address).map((value) => `${value ?? ""}`.trim());
        const hasValues = values.some((value) => value);
        if (!hasValues) return [];
        const parsed = addressSchema.safeParse({
                ...address,
                tagName: address.tagName?.trim() || "Head Office",
                building: address.building?.trim() || "",
                street: address.street?.trim() || "",
                city: address.city?.trim() || "",
                state: address.state?.trim() || "",
                pincode: address.pincode?.trim() || "",
                country: address.country?.trim() || "India",
        });
        return parsed.success ? [parsed.data] : [];
};
