import { NextResponse } from "next/server";
import User from "@/model/User.js";
import { dbConnect } from "@/lib/dbConnect.js";

// GET - Fetch all sellers (exclude admins)
export async function GET(request) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page")) || 1;
		const limit = Number.parseInt(searchParams.get("limit")) || 10;
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "";

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
		await connectDB();

		const body = await request.json();
		const { firstName, lastName, email, mobile, password, address } = body;

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
			address,
			userType: "seller",
			status: "active",
		});

		await seller.save();

		// Remove password from response
		const sellerResponse = seller.toObject();
		delete sellerResponse.password;

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
