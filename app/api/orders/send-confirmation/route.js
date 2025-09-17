// /app/api/orders/send-confirmation/route.js
import { NextResponse } from "next/server";
import User from "@/model/User";
import { dbConnect } from "@/lib/dbConnect.js";
import { companyInfo } from "@/constants/companyInfo.js";
import { sendOrderConfirmationEmail } from "@/lib/orders/email.js";

export async function POST(req) {
        try {
                await dbConnect();

                const body = await req.json();
                const { orderData, userId, pdfBase64 } = body;

                if (!orderData || !userId) {
                        return NextResponse.json(
                                { success: false, error: "Order data and user ID are required" },
                                { status: 400 }
                        );
                }

                const user = await User.findById(userId).select(
                        "email firstName notificationPreferences"
                );

                if (!user) {
                        return NextResponse.json(
                                { success: false, error: "User not found" },
                                { status: 404 }
                        );
                }

                const prefs = user?.notificationPreferences;
                const emailOptOut =
                        prefs?.channels?.email === false ||
                        prefs?.settings?.["order-placed"]?.email === false;

                if (emailOptOut) {
                        return NextResponse.json({
                                success: true,
                                message: "User opted out of email notifications",
                                emailSent: false,
                        });
                }

                const orderForEmail = {
                        ...orderData,
                        customerEmail: orderData.customerEmail || user.email,
                        customerName: orderData.customerName || user.firstName,
                };

                try {
                        const emailResult = await sendOrderConfirmationEmail({
                                order: orderForEmail,
                                to: user.email,
                                cc: companyInfo.adminEmail ? [companyInfo.adminEmail] : undefined,
                                pdfBase64,
                                attachInvoice: !pdfBase64,
                        });

                        return NextResponse.json({
                                success: true,
                                message: "Order confirmation email sent successfully",
                                emailSent: true,
                                pdfAttached: emailResult.pdfAttached,
                                pdfError: emailResult.pdfError,
                        });
                } catch (mailError) {
                        console.error("Failed to send order confirmation email:", mailError);
                        return NextResponse.json(
                                {
                                        success: false,
                                        error: "Failed to send email",
                                        details: mailError.message,
                                },
                                { status: 500 }
                        );
                }
        } catch (error) {
                console.error("Email confirmation error:", error);
                return NextResponse.json(
                        { success: false, error: error.message },
                        { status: 500 }
                );
        }
}
