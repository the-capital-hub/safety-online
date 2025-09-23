import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import companyDetails from "@/model/companyDetails";
import { companyUpdateSchema } from "@/zodSchema/companyScema.js";

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

		const updateData = { ...parsed.data };
		const updatedCompany = await companyDetails.findByIdAndUpdate(
			user.company,
			{ $set: updateData },
			{ new: true }
		);

		return NextResponse.json(
			{ message: "Company updated successfully", company: updatedCompany },
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
