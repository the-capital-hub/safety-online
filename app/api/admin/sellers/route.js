import { NextResponse } from "next/server";
import User from "@/model/User.js";
import Company from "@/model/companyDetails.js";
import { dbConnect } from "@/lib/dbConnect.js";
import { fetchGstDetails, extractPrimaryGstAddress } from "@/lib/services/gstVerification.js";

const COMPANY_PROJECTION =
        "companyName companyEmail phone gstinNumber brandName brandDescription companyLogo companyAddress";

// GET - Fetch all sellers (exclude admins)
export async function GET(request) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page")) || 1;
		const limit = Number.parseInt(searchParams.get("limit")) || 10;
		const search = searchParams.get("search") || "";
                const statusParam = searchParams.get("status") || "";
                const status = statusParam === "all" ? "" : statusParam;

		const skip = (page - 1) * limit;

		// Build query - exclude admin users
		const query = { userType: "seller" };

		if (search) {
			query.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ mobile: { $regex: search, $options: "i" } },
			];
		}

		if (status) {
			query.status = status;
		}

                const sellers = await User.find(query)
                        .select("-password")
                        .populate({ path: "company", select: COMPANY_PROJECTION })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit);

		const total = await User.countDocuments(query);

		return NextResponse.json({
			success: true,
			data: sellers,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// POST - Add new seller
export async function POST(request) {
	try {
		await dbConnect();

                const body = await request.json();
                const {
                        firstName,
                        lastName,
                        email,
                        mobile,
                        password,
                        status = "active",
                        company,
                } = body;

		// Check if seller already exists
		const existingUser = await User.findOne({
			$or: [{ email }, { mobile }],
		});

		if (existingUser) {
			return NextResponse.json(
				{
					success: false,
					error: "Seller already exists with this email or mobile",
				},
				{ status: 400 }
			);
		}

                const seller = new User({
                        firstName,
                        lastName,
                        email,
                        mobile,
                        password,
                        userType: "seller",
                        status,
                });

                await seller.save();

                if (company) {
                        const {
                                companyName,
                                companyEmail,
                                phone,
                                gstinNumber,
                                brandName,
                                brandDescription,
                                companyLogo,
                        } = company;

                        if (!companyName || !companyEmail || !phone || !gstinNumber) {
                                return NextResponse.json(
                                        {
                                                success: false,
                                                error: "Company name, email, phone, and GSTIN are required",
                                        },
                                        { status: 400 }
                                );
                        }

                        const normalizedGstin = gstinNumber.trim().toUpperCase();

                        let gstPrimaryAddress;
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

                        const company = await Company.create({
                                user: seller._id,
                                companyName,
                                companyEmail,
                                phone,
                                gstinNumber: normalizedGstin,
                                brandName,
                                brandDescription,
                                companyLogo,
                                companyAddress: [gstPrimaryAddress],
                        });

                        seller.company = company._id;
                        await seller.save();
                }

                // Remove password from response
                const sellerResponse = await User.findById(seller._id)
                        .select("-password")
                        .populate({ path: "company", select: COMPANY_PROJECTION })
                        .lean();

                return NextResponse.json({
                        success: true,
			data: sellerResponse,
			message: "Seller added successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
