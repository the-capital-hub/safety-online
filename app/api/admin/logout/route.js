import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Delete cookie
  cookies().delete("admin_token");

  return NextResponse.json({ message: "Logged out successfully" });
}
