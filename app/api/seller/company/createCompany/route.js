import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import companyDetails from "@/model/companyDetails";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";
import { companyCreateSchema } from "@/zodSchema/companyScema.js";

export async function POST(req) {
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
				{ error: "Only sellers can create a company" },
				{ status: 403 }
			);

		// If already has a company, prevent duplicate
		if (user.company) {
			return NextResponse.json(
				{ error: "Company already exists. Use update instead." },
				{ status: 409 }
			);
		}

		const body = await req.json();
		const parsed = companyCreateSchema.safeParse(body);
		if (!parsed.success) {
			const first = parsed.error.errors[0];
			return NextResponse.json({ error: first.message }, { status: 400 });
		}

		const company = await companyDetails.create({
			user: user._id,
			companyName: parsed.data.companyName,
			companyAddress: parsed.data.companyAddress || [], // optional now
			companyEmail: parsed.data.companyEmail,
			phone: parsed.data.phone,
			companyLogo: parsed.data.companyLogo,
			gstinNumber: parsed.data.gstinNumber,
		});

		user.company = company._id;
		await user.save();

		return NextResponse.json(
			{ message: "Company created successfully", company },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating company:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
