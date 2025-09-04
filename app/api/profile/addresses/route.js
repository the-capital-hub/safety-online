import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";
import mongoose from "mongoose";

export async function GET(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		const user = await User.findById(userId).select("addresses").lean();
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			addresses: user.addresses || [],
		});
	} catch (e) {
		console.error("[addresses GET]", e);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(req) {
	try {
		await dbConnect();
		const body = await req.json();
		const { userId, addresses } = body || {};

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(addresses)) {
			return NextResponse.json(
				{ error: "Addresses must be an array" },
				{ status: 400 }
			);
		}

		// Validate each address
		for (const address of addresses) {
			if (
				!address.name ||
				!address.street ||
				!address.city ||
				!address.state ||
				!address.zipCode
			) {
				return NextResponse.json(
					{
						error:
							"Each address must have name, street, city, state, and zipCode",
					},
					{ status: 400 }
				);
			}
		}

		// Ensure only one default address
		const defaultAddresses = addresses.filter((addr) => addr.isDefault);
		if (defaultAddresses.length > 1) {
			return NextResponse.json(
				{ error: "Only one address can be set as default" },
				{ status: 400 }
			);
		}

		// Generate IDs for new addresses that don't have them
		const addressesWithIds = addresses.map((addr) => ({
			...addr,
			_id: addr._id || new mongoose.Types.ObjectId(),
		}));

		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: { addresses: addressesWithIds } },
			{ new: true, runValidators: true }
		);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(
			{
				success: true,
				message: "Addresses updated successfully",
				addresses: user.addresses,
			},
			{ status: 200 }
		);
	} catch (e) {
		console.error("Failed to update addresses", e);

		// Handle validation errors
		if (e.name === "ValidationError") {
			const errors = Object.values(e.errors).map((err) => err.message);
			return NextResponse.json(
				{ message: "Validation error", errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: "Failed to update addresses" },
			{ status: 500 }
		);
	}
}

export async function POST(req) {
	try {
		await dbConnect();
		const body = await req.json();
		const { userId, address } = body || {};

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}

		if (
			!address ||
			!address.name ||
			!address.street ||
			!address.city ||
			!address.state ||
			!address.zipCode
		) {
			return NextResponse.json(
				{ error: "Address must have name, street, city, state, and zipCode" },
				{ status: 400 }
			);
		}

		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// If this is being set as default, unset other defaults
		if (address.isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

		// Add new address with generated ID
		const newAddress = {
			...address,
			_id: new mongoose.Types.ObjectId(),
		};

		user.addresses.push(newAddress);
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Address added successfully",
				address: newAddress,
			},
			{ status: 201 }
		);
	} catch (e) {
		console.error("Failed to add address", e);

		// Handle validation errors
		if (e.name === "ValidationError") {
			const errors = Object.values(e.errors).map((err) => err.message);
			return NextResponse.json(
				{ message: "Validation error", errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: "Failed to add address" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");
		const addressId = searchParams.get("addressId");

		if (!userId || !addressId) {
			return NextResponse.json(
				{ error: "User ID and Address ID are required" },
				{ status: 400 }
			);
		}

		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Find and remove the address
		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);
		if (addressIndex === -1) {
			return NextResponse.json({ error: "Address not found" }, { status: 404 });
		}

		user.addresses.splice(addressIndex, 1);
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Address deleted successfully",
			},
			{ status: 200 }
		);
	} catch (e) {
		console.error("Failed to delete address", e);
		return NextResponse.json(
			{ message: "Failed to delete address" },
			{ status: 500 }
		);
	}
}
