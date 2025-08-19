import { NextResponse } from "next/server";
import User from "@/model/User.js";
import connectDB from "@/lib/dbConnect.js";

// GET - Fetch single customer
export async function GET(request, { params }) {
	try {
		await connectDB();

		const customer = await User.findOne({
			_id: params.id,
			userType: "customer",
		}).select("-password");

		if (!customer) {
			return NextResponse.json(
				{ success: false, error: "Customer not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: customer,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// PUT - Update customer
export async function PUT(request, { params }) {
	try {
		await connectDB();

		const body = await request.json();
		const { firstName, lastName, email, mobile, status } = body;

		const customer = await User.findOneAndUpdate(
			{ _id: params.id, userType: "customer" },
			{
				firstName,
				lastName,
				email,
				mobile,
				status,
			},
			{ new: true, runValidators: true }
		).select("-password");

		if (!customer) {
			return NextResponse.json(
				{ success: false, error: "Customer not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: customer,
			message: "Customer updated successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

// DELETE - Delete customer
export async function DELETE(request, { params }) {
	try {
		await connectDB();

		const customer = await User.findOneAndDelete({
			_id: params.id,
			userType: "customer",
		});

		if (!customer) {
			return NextResponse.json(
				{ success: false, error: "Customer not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Customer deleted successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
