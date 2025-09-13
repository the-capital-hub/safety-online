import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import companyDetails from "@/model/companyDetails";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("seller-auth-token")?.value;


    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log("userid", userId);

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "seller") {
      return NextResponse.json(
        { error: "Only sellers can create a company" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      companyName,
      companyAddress,
      companyEmail,
      phone,
      companyLogo,
      gstinNumber,
    } = body;

    if (!Array.isArray(companyAddress) || companyAddress.length === 0) {
      return NextResponse.json(
        { error: "Company address must be a non-empty array" },
        { status: 400 }
      );
    }
    for (const addr of companyAddress) {
      if (!addr.street || !addr.city || !addr.state || !addr.pincode || !addr.country) {
        return NextResponse.json(
          { error: "Each address must include street, city, state, pincode, and country" },
          { status: 400 }
        );
      }
    }

    const company = await companyDetails.create({
      user: user._id,
      companyName,
      companyAddress, 
      companyEmail,
      phone,
      companyLogo,
      gstinNumber,
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
