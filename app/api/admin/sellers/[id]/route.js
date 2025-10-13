import { NextResponse } from "next/server";
import User from "@/model/User.js";
import Company from "@/model/companyDetails.js";
import { dbConnect } from "@/lib/dbConnect.js";
import { fetchGstDetails, extractPrimaryGstAddress } from "@/lib/services/gstVerification.js";

const COMPANY_PROJECTION =
        "companyName companyEmail phone gstinNumber brandName brandDescription companyLogo companyAddress primaryPickupAddress";

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

                                let normalizedGstin = companyDoc?.gstinNumber;
                                let gstPrimaryAddress;

                                if (typeof gstinNumber !== "undefined") {
                                        normalizedGstin = gstinNumber.trim().toUpperCase();

                                        if (!normalizedGstin) {
                                                return NextResponse.json(
                                                        {
                                                                success: false,
                                                                error: "GSTIN is required",
                                                        },
                                                        { status: 400 }
                                                );
                                        }

                                        try {
                                                const gstDetails = await fetchGstDetails(normalizedGstin);
                                                gstPrimaryAddress = extractPrimaryGstAddress(gstDetails);
                                        } catch (gstError) {
                                                return NextResponse.json(
                                                        {
                                                                success: false,
                                                                error:
                                                                        gstError.message ||
                                                                        "Failed to fetch GST details for the provided GSTIN",
                                                        },
                                                        { status: 400 }
                                                );
                                        }
                                }

                                if (!companyDoc) {
                                        if (!companyName || !companyEmail || !phone || !normalizedGstin) {
                                                return NextResponse.json(
                                                        {
                                                                success: false,
                                                                error: "Company name, email, phone, and GSTIN are required to create company details",
                                                        },
                                                        { status: 400 }
                                                );
                                        }

                                        companyDoc = new Company({
                                                user: seller._id,
                                                companyName,
                                                companyEmail,
                                                phone,
                                                gstinNumber: normalizedGstin,
                                                companyAddress: gstPrimaryAddress
                                                        ? [gstPrimaryAddress]
                                                        : [],
                                                primaryPickupAddress: gstPrimaryAddress || null,
                                        });
                                }

                                if (typeof companyName !== "undefined")
                                        companyDoc.companyName = companyName;
                                if (typeof companyEmail !== "undefined")
                                        companyDoc.companyEmail = companyEmail;
                                if (typeof phone !== "undefined") companyDoc.phone = phone;
                                if (normalizedGstin) companyDoc.gstinNumber = normalizedGstin;
                                if (typeof brandName !== "undefined")
                                        companyDoc.brandName = brandName;
                                if (typeof brandDescription !== "undefined")
                                        companyDoc.brandDescription = brandDescription;
                                if (typeof companyLogo !== "undefined")
                                        companyDoc.companyLogo = companyLogo;

                                if (gstPrimaryAddress) {
                                        const normalize = (value = "") => `${value}`.trim().toLowerCase();
                                        const remainingAddresses = Array.isArray(companyDoc.companyAddress)
                                                ? companyDoc.companyAddress.filter((address, index) => {
                                                          if (!address) return false;
                                                          if (index === 0) return false;
                                                          return !(
                                                                  normalize(address.building) ===
                                                                          normalize(gstPrimaryAddress.building) &&
                                                                  normalize(address.street) ===
                                                                          normalize(gstPrimaryAddress.street) &&
                                                                  normalize(address.city) === normalize(gstPrimaryAddress.city) &&
                                                                  normalize(address.state) === normalize(gstPrimaryAddress.state) &&
                                                                  normalize(address.pincode) === normalize(gstPrimaryAddress.pincode) &&
                                                                  normalize(address.country) === normalize(gstPrimaryAddress.country)
                                                          );
                                                  })
                                                : [];
                                        companyDoc.companyAddress = [gstPrimaryAddress, ...remainingAddresses];
                                        companyDoc.primaryPickupAddress = gstPrimaryAddress;
                                }
                                if (!gstPrimaryAddress && Array.isArray(companyDoc.companyAddress)) {
                                        companyDoc.primaryPickupAddress =
                                                companyDoc.companyAddress[0] || companyDoc.primaryPickupAddress;
                                }

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
