import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import companyDetails from "@/model/companyDetails";
import { companyUpdateSchema } from "@/zodSchema/companyScema.js";
import { fetchGstDetails, extractPrimaryGstAddress } from "@/lib/services/gstVerification.js";

export async function PUT(req) {
	try {
		await dbConnect();
		const cookieStore = await cookies();
		const token = cookieStore.get("seller-auth-token")?.value;
		if (!token)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		const user = await User.findById(decoded.userId);
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		if (user.userType !== "seller")
			return NextResponse.json(
				{ error: "Only sellers can update company details" },
				{ status: 403 }
			);
		if (!user.company)
			return NextResponse.json(
				{ error: "No company found for this seller" },
				{ status: 404 }
			);

		const body = await req.json();
		const parsed = companyUpdateSchema.safeParse(body);
		if (!parsed.success) {
			const first = parsed.error.errors[0];
			return NextResponse.json({ error: first.message }, { status: 400 });
		}

                const companyDoc = await companyDetails.findById(user.company);
                if (!companyDoc) {
                        return NextResponse.json(
                                { error: "Company not found" },
                                { status: 404 }
                        );
                }

                const updateData = { ...parsed.data };
                let gstPrimaryAddress;

                if (typeof updateData.gstinNumber !== "undefined") {
                        const normalizedGstin = updateData.gstinNumber.trim().toUpperCase();

                        try {
                                const gstDetails = await fetchGstDetails(normalizedGstin);
                                gstPrimaryAddress = extractPrimaryGstAddress(gstDetails);
                        } catch (gstError) {
                                return NextResponse.json(
                                        {
                                                error:
                                                        gstError.message ||
                                                        "Failed to verify GST details. Please confirm the GSTIN and try again.",
                                        },
                                        { status: 400 }
                                );
                        }

                        updateData.gstinNumber = normalizedGstin;
                }

                Object.entries(updateData).forEach(([key, value]) => {
                        if (key === "companyAddress" || typeof value === "undefined") {
                                return;
                        }
                        companyDoc[key] = value;
                });

                const baseAddresses =
                        typeof updateData.companyAddress !== "undefined"
                                ? updateData.companyAddress
                                : companyDoc.companyAddress || [];

                if (gstPrimaryAddress) {
                        const normalize = (value = "") => `${value}`.trim().toLowerCase();
                        const remainingAddresses = Array.isArray(baseAddresses)
                                ? baseAddresses.filter((address, index) => {
                                          if (!address) return false;
                                          if (index === 0) return false;
                                          return !(
                                                  normalize(address.building) ===
                                                          normalize(gstPrimaryAddress.building) &&
                                                  normalize(address.street) === normalize(gstPrimaryAddress.street) &&
                                                  normalize(address.city) === normalize(gstPrimaryAddress.city) &&
                                                  normalize(address.state) === normalize(gstPrimaryAddress.state) &&
                                                  normalize(address.pincode) === normalize(gstPrimaryAddress.pincode) &&
                                                  normalize(address.country) === normalize(gstPrimaryAddress.country)
                                          );
                                  })
                                : [];

                        companyDoc.companyAddress = [gstPrimaryAddress, ...remainingAddresses];
                } else if (typeof updateData.companyAddress !== "undefined") {
                        companyDoc.companyAddress = baseAddresses;
                }

                await companyDoc.save();

                return NextResponse.json(
                        { message: "Company updated successfully", company: companyDoc },
                        { status: 200 }
                );
	} catch (error) {
		console.error("Error updating company:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
