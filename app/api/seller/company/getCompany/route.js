// app/api/seller/company/getCompany/route.js

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function GET() {
	try {
		await dbConnect();

		const cookieStore = await cookies();
		const token = cookieStore.get("seller-auth-token")?.value;

		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		const user = await User.findById(decoded.userId).populate("company");

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (user.userType !== "seller") {
			return NextResponse.json(
				{ error: "Only sellers can have company details" },
				{ status: 403 }
			);
		}

		if (!user.company) {
			return NextResponse.json(
				{ error: "No company found for this seller" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ company: user.company }, { status: 200 });
	} catch (error) {
		console.error("Error fetching company:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
