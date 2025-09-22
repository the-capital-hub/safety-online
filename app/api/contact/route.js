import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import AdminContact from "@/model/AdminContact.js";
import { sendMail } from "@/lib/mail.js";
import { companyInfo } from "@/constants/companyInfo";

const CONTACT_RECIPIENT = "de.capitalhub@gmail.com";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const message = body.message?.trim();

    const errors = [];

    if (!firstName) {
      errors.push("First name is required.");
    }

    if (!email || !emailRegex.test(email)) {
      errors.push("A valid email address is required.");
    }

    if (!phone) {
      errors.push("A contact number is required.");
    }

    if (!message || message.length < 10) {
      errors.push("Message should be at least 10 characters long.");
    }

    if (errors.length) {
      return NextResponse.json(
        {
          success: false,
          message: errors.join(" "),
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const contactRecord = await AdminContact.create({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    const fullName = `${firstName}${lastName ? ` ${lastName}` : ""}`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #facc15; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #000000, #facc15); padding: 24px; color: #fefce8;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">New contact enquiry received</h2>
            <p style="margin: 8px 0 0; opacity: 0.8;">The Safety Online website has received a new message.</p>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px;">Hi Team,</p>
            <p style="margin: 0 0 16px;">${fullName} has submitted a contact request. The details are below:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                <tr>
                  <td style="padding: 12px; font-weight: 600; border: 1px solid #f3f4f6; width: 160px;">Name</td>
                  <td style="padding: 12px; border: 1px solid #f3f4f6;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: 600; border: 1px solid #f3f4f6;">Email</td>
                  <td style="padding: 12px; border: 1px solid #f3f4f6;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: 600; border: 1px solid #f3f4f6;">Phone</td>
                  <td style="padding: 12px; border: 1px solid #f3f4f6;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: 600; border: 1px solid #f3f4f6;">Message</td>
                  <td style="padding: 12px; border: 1px solid #f3f4f6; white-space: pre-wrap;">${message}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: 600; border: 1px solid #f3f4f6;">Submitted</td>
                  <td style="padding: 12px; border: 1px solid #f3f4f6;">${new Date(contactRecord.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "long",
                    timeStyle: "short",
                  })}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">This email was sent automatically from the Safety Online contact form. Please respond directly to the customer via the contact details provided.</p>
          </div>
          <div style="background: #111827; color: #facc15; padding: 16px 24px; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
            <span>${companyInfo.name}</span>
            <span>${companyInfo.email}</span>
          </div>
        </div>
      </div>
    `;

    try {
      await sendMail({
        to: CONTACT_RECIPIENT,
        subject: `New contact enquiry from ${fullName}`,
        html: emailHtml,
      });
    } catch (mailError) {
      console.error("[CONTACT_EMAIL_ERROR]", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our team will contact you soon.",
    });
  } catch (error) {
    console.error("[CONTACT_POST_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "We couldn't submit your request right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
