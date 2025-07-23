import { dbConnect } from "@/lib/dbConnect";
import Verification from "@/model/Verification.js";
import nodemailer from "nodemailer";

function generateCode() {
	return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

export async function POST(req) {
	await dbConnect();
	const { email } = await req.json();
	const code = generateCode();

	await Verification.findOneAndUpdate(
		{ email },
		{ code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
		{ upsert: true }
	);

	await transporter.sendMail({
		from: process.env.MAIL_USER,
		to: email,
		subject: "Verification Code",
		text: `Your verification code is ${code}`,
	});

	return Response.json({ message: "Verification code sent" });
}
