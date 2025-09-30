"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Banknote, Edit3, Loader2, PlusCircle, Save, X } from "lucide-react";

import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";

import { bankDetailsSchema } from "@/zodSchema/companyScema.js";
import { useSellerCompanyStore } from "@/store/sellerCompanyStore.js";

const EMPTY_FORM = {
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        accountType: "",
        upiId: "",
};

const ACCOUNT_TYPE_OPTIONS = [
        { label: "Savings", value: "savings" },
        { label: "Current", value: "current" },
        { label: "Overdraft", value: "overdraft" },
        { label: "Cash Credit", value: "cash_credit" },
];

const maskAccountNumber = (accountNumber = "") => {
        if (!accountNumber) return "--";
        const sanitized = accountNumber.replace(/\s+/g, "");
        if (sanitized.length <= 4) return sanitized;
        return `${"•".repeat(Math.max(0, sanitized.length - 4))}${sanitized.slice(-4)}`;
};

const formatValue = (value) => (value?.trim?.() ? value.trim() : "--");

const useBankForm = (company) => {
        const formState = useMemo(() => {
                if (company?.bankDetails) {
                        const { lastUpdatedAt, ...details } = company.bankDetails;
                        return {
                                ...EMPTY_FORM,
                                ...details,
                                confirmAccountNumber: details.accountNumber || "",
                        };
                }
                return EMPTY_FORM;
        }, [company?.bankDetails]);

        return formState;
};

const getAccountTypeLabel = (value) => {
        if (!value) return "--";
        const option = ACCOUNT_TYPE_OPTIONS.find((item) => item.value === value);
        return option ? option.label : value;
};

export default function BankDetailsCard() {
        const company = useSellerCompanyStore((state) => state.company);
        const loading = useSellerCompanyStore((state) => state.loading);
        const initialized = useSellerCompanyStore((state) => state.initialized);
        const bankSaving = useSellerCompanyStore((state) => state.bankSaving);
        const fetchCompany = useSellerCompanyStore((state) => state.fetchCompany);
        const updateBankDetails = useSellerCompanyStore((state) => state.updateBankDetails);

        const [isEditing, setIsEditing] = useState(false);
        const [form, setForm] = useState(EMPTY_FORM);

        const baseForm = useBankForm(company);

        useEffect(() => {
                if (!initialized) {
                        fetchCompany().catch(() => undefined);
                }
        }, [initialized, fetchCompany]);

        useEffect(() => {
                setForm(baseForm);
        }, [baseForm]);

        const isInitializing = loading && !initialized;
        const hasDetails = Boolean(company?.bankDetails?.accountHolderName);

        const handleStartEdit = () => {
                if (!company?._id) {
                        toast.error("Create your company profile before adding bank details.");
                        return;
                }
                setIsEditing(true);
        };

        const handleCancel = () => {
                setIsEditing(false);
                setForm(baseForm);
        };

        const handleChange = (event) => {
                const { name, value } = event.target;
                setForm((prev) => ({ ...prev, [name]: value }));
        };

        const handleAccountTypeChange = (value) => {
                setForm((prev) => ({ ...prev, accountType: value }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();

                if (!company?._id) {
                        toast.error("Create your company profile before adding bank details.");
                        return;
                }

                if (!form.accountNumber || form.accountNumber !== form.confirmAccountNumber) {
                        toast.error("Account numbers do not match");
                        return;
                }

                const { confirmAccountNumber, ...payload } = form;
                const parsed = bankDetailsSchema.safeParse(payload);

                if (!parsed.success) {
                        toast.error(parsed.error.errors[0]?.message || "Invalid bank details");
                        return;
                }

                const result = await updateBankDetails(parsed.data);

                if (result.success) {
                        toast.success(result.message || "Bank details updated successfully");
                        setIsEditing(false);
                } else {
                        toast.error(result.message || "Failed to save bank details");
                }
        };

        return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                        <Card className="border border-gray-200">
                                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                                <CardTitle>Bank Details</CardTitle>
                                                <CardDescription>
                                                        Provide settlement bank information for manual payouts.
                                                </CardDescription>
                                        </div>
                                        {!isEditing && (
                                                <Button
                                                        variant={hasDetails ? "secondary" : "default"}
                                                        onClick={handleStartEdit}
                                                        size="sm"
                                                        disabled={isInitializing}
                                                >
                                                        {hasDetails ? (
                                                                <>
                                                                        <Edit3 className="mr-1 h-4 w-4" /> Edit
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <PlusCircle className="mr-1 h-4 w-4" /> Add
                                                                </>
                                                        )}
                                                </Button>
                                        )}
                                </CardHeader>
                                <CardContent className="space-y-5">
                                        {isInitializing ? (
                                                <div className="flex items-center gap-3 text-gray-500">
                                                        <Loader2 className="h-4 w-4 animate-spin" /> Fetching bank details…
                                                </div>
                                        ) : null}

                                        {!isEditing && !isInitializing && (
                                                <div className="grid gap-4 rounded-lg border border-dashed p-4">
                                                        {hasDetails ? (
                                                                <>
                                                                        <div className="flex items-start gap-3">
                                                                                <Banknote className="mt-1 h-5 w-5 text-emerald-600" />
                                                                                <div className="space-y-2">
                                                                                        <div>
                                                                                                <p className="text-sm font-medium text-gray-500">
                                                                                                        Account Holder
                                                                                                </p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {formatValue(company.bankDetails.accountHolderName)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">
                                                                                                        Account Number
                                                                                                </p>
                                                                                                <p className="font-semibold tracking-widest text-gray-900">
                                                                                                        {maskAccountNumber(company.bankDetails.accountNumber)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">IFSC Code</p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {formatValue(company.bankDetails.ifscCode)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">Bank Name</p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {formatValue(company.bankDetails.bankName)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">Branch</p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {formatValue(company.bankDetails.branchName)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">Account Type</p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {getAccountTypeLabel(company.bankDetails.accountType)}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="grid gap-1">
                                                                                                <p className="text-sm font-medium text-gray-500">UPI ID</p>
                                                                                                <p className="font-semibold text-gray-900">
                                                                                                        {formatValue(company.bankDetails.upiId)}
                                                                                                </p>
                                                                                        </div>
                                                                                        {company.bankDetails.lastUpdatedAt && (
                                                                                                <p className="text-xs text-gray-500">
                                                                                                        Last updated {new Date(company.bankDetails.lastUpdatedAt).toLocaleString()}
                                                                                                </p>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </>
                                                        ) : (
                                                                <div className="text-sm text-gray-500">
                                                                        Add bank account details to receive manual settlements directly in your
                                                                        registered account.
                                                                </div>
                                                        )}
                                                </div>
                                        )}

                                        {isEditing && (
                                                <form onSubmit={handleSubmit} className="grid gap-4">
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                                                <Input
                                                                        id="accountHolderName"
                                                                        name="accountHolderName"
                                                                        value={form.accountHolderName}
                                                                        onChange={handleChange}
                                                                        placeholder="As per bank records"
                                                                        required
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="accountNumber">Account Number</Label>
                                                                <Input
                                                                        id="accountNumber"
                                                                        name="accountNumber"
                                                                        value={form.accountNumber}
                                                                        onChange={handleChange}
                                                                        inputMode="numeric"
                                                                        placeholder="Enter bank account number"
                                                                        required
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                                                                <Input
                                                                        id="confirmAccountNumber"
                                                                        name="confirmAccountNumber"
                                                                        value={form.confirmAccountNumber}
                                                                        onChange={handleChange}
                                                                        inputMode="numeric"
                                                                        placeholder="Re-enter bank account number"
                                                                        required
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="ifscCode">IFSC Code</Label>
                                                                <Input
                                                                        id="ifscCode"
                                                                        name="ifscCode"
                                                                        value={form.ifscCode}
                                                                        onChange={(event) =>
                                                                                setForm((prev) => ({
                                                                                        ...prev,
                                                                                        ifscCode: event.target.value.toUpperCase(),
                                                                                }))
                                                                        }
                                                                        placeholder="SBIN0000123"
                                                                        required
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="bankName">Bank Name</Label>
                                                                <Input
                                                                        id="bankName"
                                                                        name="bankName"
                                                                        value={form.bankName}
                                                                        onChange={handleChange}
                                                                        placeholder="State Bank of India"
                                                                        required
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="branchName">Branch Name (optional)</Label>
                                                                <Input
                                                                        id="branchName"
                                                                        name="branchName"
                                                                        value={form.branchName}
                                                                        onChange={handleChange}
                                                                        placeholder="Main Branch"
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label>Account Type (optional)</Label>
                                                                <Select
                                                                        value={form.accountType || ""}
                                                                        onValueChange={handleAccountTypeChange}
                                                                        disabled={bankSaving}
                                                                >
                                                                        <SelectTrigger>
                                                                                <SelectValue placeholder="Select account type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                                <SelectItem value="">Not specified</SelectItem>
                                                                                {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                                                                        <SelectItem key={option.value} value={option.value}>
                                                                                                {option.label}
                                                                                        </SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                </Select>
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="upiId">UPI ID (optional)</Label>
                                                                <Input
                                                                        id="upiId"
                                                                        name="upiId"
                                                                        value={form.upiId}
                                                                        onChange={handleChange}
                                                                        placeholder="business@bank"
                                                                        disabled={bankSaving}
                                                                />
                                                        </div>
                                                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                                                <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={handleCancel}
                                                                        disabled={bankSaving}
                                                                >
                                                                        <X className="mr-1 h-4 w-4" /> Cancel
                                                                </Button>
                                                                <Button type="submit" disabled={bankSaving}>
                                                                        {bankSaving ? (
                                                                                <>
                                                                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Saving
                                                                                </>
                                                                        ) : (
                                                                                <>
                                                                                        <Save className="mr-1 h-4 w-4" /> Save
                                                                                </>
                                                                        )}
                                                                </Button>
                                                        </div>
                                                </form>
                                        )}
                                </CardContent>
                        </Card>
                </motion.div>
        );
}
