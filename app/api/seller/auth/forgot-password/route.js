import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import { createToken } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req) {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
                return Response.json({ message: "Email is required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();
        const seller = await User.findOne({ email: normalizedEmail, userType: "seller" });

        if (!seller) {
                return Response.json({ message: "Seller account not found" }, { status: 404 });
        }

        const token = createToken(seller);

        const requestUrl = new URL(req.url);
        const envBaseUrl = [process.env.NEXT_PUBLIC_BASE_URL, process.env.BASE_URL].reduce(
                (validUrl, candidate) => {
                        if (validUrl || !candidate) return validUrl;
                        try {
                                return new URL(candidate);
                        } catch {
                                return validUrl;
                        }
                },
                null
        );

        const resetUrl = new URL("/reset-password", envBaseUrl ?? requestUrl);
        resetUrl.searchParams.set("token", token);
        resetUrl.searchParams.set("redirect", "/seller/login");
        const resetLink = resetUrl.toString();

        const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS,
                },
        });

        await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: normalizedEmail,
                subject: "Seller Password Reset",
                text: `Reset your seller password: ${resetLink}`,
        });

        return Response.json({ message: "Password reset email sent" });
}
