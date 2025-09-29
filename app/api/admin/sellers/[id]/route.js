import { NextResponse } from "next/server";
import User from "@/model/User.js";
import Company from "@/model/companyDetails.js";
import { dbConnect } from "@/lib/dbConnect.js";

const COMPANY_PROJECTION =
        "companyName companyEmail phone gstinNumber brandName brandDescription companyLogo";

// GET - Fetch single seller
export async function GET(request, { params }) {
	try {
		await dbConnect();

                const seller = await User.findOne({
                        _id: params.id,
                        userType: "seller",
                })
                        .select("-password")
                        .populate({ path: "company", select: COMPANY_PROJECTION });

		if (!seller) {
			return NextResponse.json(
				{ success: false, error: "Seller not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: seller,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// PUT - Update seller
export async function PUT(request, { params }) {
	try {
		await dbConnect();

                const body = await request.json();
                const { firstName, lastName, email, mobile, status } = body;

                const seller = await User.findOne({
                        _id: params.id,
                        userType: "seller",
                });

                if (!seller) {
                        return NextResponse.json(
                                { success: false, error: "Seller not found" },
                                { status: 404 }
                        );
                }

                if (typeof firstName !== "undefined") seller.firstName = firstName;
                if (typeof lastName !== "undefined") seller.lastName = lastName;
                if (typeof email !== "undefined") seller.email = email;
                if (typeof mobile !== "undefined") seller.mobile = mobile;
                if (typeof status !== "undefined") seller.status = status;

                if (body.company) {
                        const {
                                companyName,
                                companyEmail,
                                phone,
                                gstinNumber,
                                brandName,
                                brandDescription,
                                companyLogo,
                        } = body.company;

                        const hasCompanyData = [
                                companyName,
                                companyEmail,
                                phone,
                                gstinNumber,
                                brandName,
                                brandDescription,
                                companyLogo,
                        ].some((value) => typeof value !== "undefined");

                        if (hasCompanyData) {
                                let companyDoc = null;

                                if (seller.company) {
                                        companyDoc = await Company.findById(seller.company);
                                }

                                if (!companyDoc) {
                                        if (!companyName || !companyEmail || !phone) {
                                                return NextResponse.json(
                                                        {
                                                                success: false,
                                                                error: "Company name, email and phone are required to create company details",
                                                        },
                                                        { status: 400 }
                                                );
                                        }

                                        companyDoc = new Company({
                                                user: seller._id,
                                                companyName,
                                                companyEmail,
                                                phone,
                                        });
                                }

                                if (typeof companyName !== "undefined")
                                        companyDoc.companyName = companyName;
                                if (typeof companyEmail !== "undefined")
                                        companyDoc.companyEmail = companyEmail;
                                if (typeof phone !== "undefined") companyDoc.phone = phone;
                                if (typeof gstinNumber !== "undefined")
                                        companyDoc.gstinNumber = gstinNumber;
                                if (typeof brandName !== "undefined")
                                        companyDoc.brandName = brandName;
                                if (typeof brandDescription !== "undefined")
                                        companyDoc.brandDescription = brandDescription;
                                if (typeof companyLogo !== "undefined")
                                        companyDoc.companyLogo = companyLogo;

                                await companyDoc.save();

                                if (!seller.company) {
                                        seller.company = companyDoc._id;
                                }
                        }
                }

                await seller.save();

                const populatedSeller = await User.findById(seller._id)
                        .select("-password")
                        .populate({ path: "company", select: COMPANY_PROJECTION });

                return NextResponse.json({
                        success: true,
                        data: populatedSeller,
                        message: "Seller updated successfully",
                });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// DELETE - Delete seller
export async function DELETE(request, { params }) {
	try {
		await dbConnect();

		const seller = await User.findOneAndDelete({
			_id: params.id,
			userType: "seller",
		});

		if (!seller) {
			return NextResponse.json(
				{ success: false, error: "Seller not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Seller deleted successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
