import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import User from "@/model/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth.js";

export async function GET(request) {
	try {
		await dbConnect();

		const cookieStore = await cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		const user = await User.findById(decoded.id).select("addresses");
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			addresses: user.addresses || [],
		});
	} catch (error) {
		console.error("Get addresses error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		await dbConnect();

		const cookieStore = await cookies();
		const token = cookieStore.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Authentication required" },
				{ status: 401 }
			);
		}

		const decoded = verifyToken(token);

		// Check if request has body content
		const contentType = request.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			return NextResponse.json(
				{ success: false, message: "Content-Type must be application/json" },
				{ status: 400 }
			);
		}

		let addressData;
		try {
			const body = await request.text();
			if (!body.trim()) {
				return NextResponse.json(
					{ success: false, message: "Request body is empty" },
					{ status: 400 }
				);
			}
			addressData = JSON.parse(body);
		} catch (parseError) {
			console.error("JSON parsing error:", parseError);
			return NextResponse.json(
				{ success: false, message: "Invalid JSON in request body" },
				{ status: 400 }
			);
		}

                const {
                        tag,
                        name,
                        street,
                        city,
                        state,
                        zipCode,
			country = "India",
			isDefault = false,
		} = addressData;

		if (!tag || !name || !street || !city || !state || !zipCode) {
			return NextResponse.json(
				{ success: false, message: "All address fields are required" },
				{ status: 400 }
			);
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		// If this is set as default, unset other default addresses
		if (isDefault && user.addresses.length > 0) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

		// Add new address
                const newAddress = {
                        tag,
                        name,
                        street,
                        city,
                        state,
			zipCode,
			country,
			isDefault,
		};

		user.addresses.push(newAddress);
		await user.save();

		return NextResponse.json({
			success: true,
			message: "Address added successfully",
			address: newAddress,
		});
	} catch (error) {
		console.error("Add address error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
