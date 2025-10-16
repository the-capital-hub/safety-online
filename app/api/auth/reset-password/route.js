import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect";
import crypto from "crypto";

export async function POST(req) {
        await dbConnect();
        const { token, newPassword } = await req.json();

        try {
                if (!token || !newPassword) {
                        return Response.json(
                                { message: "Token and new password are required" },
                                { status: 400 }
                        );
                }

                const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
                const user = await User.findOne({
                        passwordResetToken: hashedToken,
                        passwordResetExpires: { $gt: new Date() },
                        passwordResetUsed: false,
                });

                if (!user)
                        return Response.json({ message: "Token expired or invalid" }, { status: 401 });

                user.password = newPassword;
                user.passwordResetUsed = true;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save();

                return Response.json({ message: "Password updated successfully" });
        } catch (err) {
                return Response.json(
                        { message: "Token expired or invalid" },
                        { status: 401 }
                );
	}
}
