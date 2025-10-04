import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect.js";
import User from "@/model/User";
import Company from "@/model/companyDetails.js";
import SellerBankDetails from "@/model/SellerBankDetails.js";
import { sellerRegistrationSchema } from "@/zodSchema/sellerRegistrationSchema.js";

export async function POST(request) {
	try {
		await dbConnect();

                const body = await request.json();
                const parsed = sellerRegistrationSchema.safeParse(body);

                if (!parsed.success) {
                        const firstIssue = parsed.error.issues[0];
                        return NextResponse.json(
                                {
                                        success: false,
                                        message: firstIssue?.message || "Invalid registration details",
                                },
                                { status: 400 }
                        );
                }

                const { personalDetails, companyDetails, bankDetails } = parsed.data;
                const { firstName, lastName, email, mobile, password } = personalDetails;

                // Check if seller already exists
                const existingUser = await User.findOne({
                        $or: [
                                { email: email.toLowerCase() },
                                { mobile },
                        ],
                });

                if (existingUser) {
                        return NextResponse.json(
                                {
                                        success: false,
                                        message: "A seller with this email or mobile already exists",
                                },
                                { status: 409 }
                        );
                }

                // Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new seller
                const newSeller = await User.create({
                        firstName,
                        lastName,
                        email: email.toLowerCase(),
                        mobile,
                        password: hashedPassword,
                        userType: "seller",
                        status: "active",
                        lastLogin: new Date(),
                });

                try {
                        const companyPayload = {
                                user: newSeller._id,
                                companyName: companyDetails.companyName,
                                companyEmail: companyDetails.companyEmail,
                                phone: companyDetails.phone,
                                brandName: companyDetails.brandName,
                                brandDescription: companyDetails.brandDescription,
                                gstinNumber: companyDetails.gstinNumber,
                                companyLogo: companyDetails.companyLogo,
                        };

                        if (companyDetails.companyAddress?.length) {
                                companyPayload.companyAddress = companyDetails.companyAddress;
                        }

                        const companyDoc = await Company.create(companyPayload);
                        newSeller.company = companyDoc._id;
                        await newSeller.save();

                        await SellerBankDetails.create({
                                user: newSeller._id,
                                accountHolderName: bankDetails.accountHolderName,
                                accountNumber: bankDetails.accountNumber,
                                ifscCode: bankDetails.ifscCode,
                                bankName: bankDetails.bankName,
                                branchName: bankDetails.branchName,
                        });
                } catch (error) {
                        await User.findByIdAndDelete(newSeller._id);
                        if (error?.code === 11000) {
                                return NextResponse.json(
                                        {
                                                success: false,
                                                message: "Bank account is already registered with another seller",
                                        },
                                        { status: 409 }
                                );
                        }
                        throw error;
                }

                return NextResponse.json({
                        success: true,
                        message: "Seller registered successfully",
                });
        } catch (error) {
                console.error("Seller registration error:", error);
                return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
