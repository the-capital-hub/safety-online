import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";
import { createToken } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req) {
	await dbConnect();
	const { email } = await req.json();

	const user = await User.findOne({ email });
	if (!user)
		return Response.json({ message: "User not found" }, { status: 404 });

	const token = createToken(user); // valid 15 mins
	const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		},
	});

	await transporter.sendMail({
		from: process.env.MAIL_USER,
		to: email,
		subject: "Password Reset",
		text: `Reset your password: ${resetLink}`,
	});

	return Response.json({ message: "Password reset email sent" });
}
