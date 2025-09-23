import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { sendMail } from "@/lib/mail";
import { companyInfo } from "@/constants/companyInfo.js";
import { z } from "zod";

const SignupSchema = z.object({
	email: z.string().trim().email("Valid email is required"),
	mobile: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Mobile must be a 10-digit number"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
});

export async function POST(req) {
	await dbConnect();
	const json = await req.json();
	const parsed = SignupSchema.safeParse(json);

	if (!parsed.success) {
		return Response.json(
			{ message: parsed.error.issues?.[0]?.message || "Invalid input" },
			{ status: 400 }
		);
	}

	const { email, mobile, password, firstName, lastName } = parsed.data;

	const existingUser = await User.findOne({
		$or: [{ email }, { mobile }],
	});

	if (existingUser) {
		return Response.json({ message: "User already exists" }, { status: 409 });
	}

	const lastLogin = Date.now();

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

	// Optional onboarding email
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
        <h2 style="color:#4f46e5;">Welcome to ${companyInfo.name}!</h2>
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

	return Response.json({ message: "Registration successful" });
}
