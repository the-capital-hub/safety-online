import { NextResponse } from "next/server"
import { z } from "zod"
import { sendOtpMobile } from "@/lib/sendMobileOtp"
import { saveOTP } from "@/lib/otpStore"

const SendCodeSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile must be a 10-digit number"),
})

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req) {
  try {
    const body = await req.json()
    const parsed = SendCodeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues?.[0]?.message || "Invalid input" }, { status: 400 })
    }

    const { mobile } = parsed.data
    const code = generateCode()

    saveOTP(mobile, code)
    await sendOtpMobile(mobile, code)

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
    })
  } catch (err) {
    console.error("OTP send error:", err)
    const message = err instanceof Error && err.message ? err.message : "Failed to send verification code"
    return NextResponse.json({ message }, { status: 500 })
  }
}
