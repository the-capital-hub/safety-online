import { NextResponse } from "next/server";
import User from "@/model/User.js";
import { dbConnect } from "@/lib/dbConnect.js";

// GET - Fetch single seller
export async function GET(request, { params }) {
	try {
		await dbConnect();

		const seller = await User.findOne({
			_id: params.id,
			userType: "seller",
		}).select("-password");

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

		const seller = await User.findOneAndUpdate(
			{ _id: params.id, userType: "seller" },
			{
				firstName,
				lastName,
				email,
				mobile,
				status,
			},
			{ new: true, runValidators: true }
		).select("-password");

		if (!seller) {
			return NextResponse.json(
				{ success: false, error: "Seller not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: seller,
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
