import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import { approveEscrowPayment } from "@/lib/payments/releaseEscrowPayment.js";

export async function POST(request, { params }) {
        try {
                await dbConnect();

                const token = request.cookies.get("admin_token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const paymentId = params?.id;

                if (!paymentId) {
                        return NextResponse.json(
                                { success: false, message: "Payment identifier is missing" },
                                { status: 400 }
                        );
                }

                const { transactionId, paymentMethod, note } = await request.json();

                const payment = await approveEscrowPayment({
                        paymentId,
                        actorId: decoded?.id || null,
                        note,
                        transactionId,
                        paymentMethod,
                });

                return NextResponse.json({
                        success: true,
                        message: "Payout approved and released",
                        payment,
                });
        } catch (error) {
                console.error("Error approving escrow payment:", error);
                return NextResponse.json(
                        { success: false, message: error.message || "Failed to approve payment" },
                        { status: 400 }
                );
        }
}
