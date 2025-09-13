import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import Verification from "@/model/Verification.js";
import { sendMail } from "@/lib/mail";
import { companyInfo } from "@/constants/companyInfo.js";

export async function POST(req) {
	await dbConnect();
	const { email, mobile, password, firstName, lastName } = await req.json();

	// Validation
	if ((!email && !mobile) || !password) {
		return Response.json(
			{ message: "Email or mobile and password required" },
			{ status: 400 }
		);
	}

	// Check if user already exists
	const existingUser = await User.findOne({
		$or: [{ email }, { mobile }],
	});

	if (existingUser) {
		return Response.json({ message: "User already exists" }, { status: 409 });
	}

	// If using email, check if it's verified
	if (email) {
		const verification = await Verification.findOne({ email });

		if (!verification) {
			return Response.json({ message: "Email not verified" }, { status: 403 });
		}

		// Delete verification record after registration
		// await Verification.deleteOne({ email });
	}

	const lastLogin = Date.now();

	// Create and save new user
	const newUser = new User({
		email,
		mobile,
		password,
		firstName,
		lastName,
		lastLogin,
		isVerified: true,
	});
	await newUser.save();

	if (email) {
		try {
			const details = [
				["First Name", newUser.firstName],
				["Last Name", newUser.lastName],
				["Email", newUser.email],
				["Mobile", newUser.mobile],
			];

			const rows = details
				.map(
					([label, value]) => `
                                        <tr>
                                                <td style="padding:8px;border:1px solid #ddd;">${label}</td>
                                                <td style="padding:8px;border:1px solid #ddd;">${
																									value || "N/A"
																								}</td>
                                        </tr>`
				)
				.join("");

			const html = `
                                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
                                        <h2 style="color:#4f46e5;">Welcome to ${
																					companyInfo.name
																				}!</h2>
                                        <p>Hi ${newUser.firstName || ""},</p>
                                        <p>Thank you for registering with ${
																					companyInfo.name
																				}. We're excited to have you on board.</p>
                                        <p>Below are the details we received during your registration:</p>
                                        <table style="width:100%;border-collapse:collapse;margin-top:16px;">${rows}</table>
                                        <p style="margin-top:16px;">If any information is incorrect, please contact us at ${
																					companyInfo.email
																				}.</p>
                                        <p style="margin-top:16px;">Best regards,<br/>${
																					companyInfo.name
																				} Team</p>
                                </div>
                        `;
			await sendMail({
				to: [email, companyInfo.adminEmail],
				subject: `Welcome to ${companyInfo.name}`,
				html,
			});
		} catch (mailErr) {
			console.error("Onboarding email error:", mailErr);
		}
	}

	return Response.json({ message: "Registration successful" });
}
