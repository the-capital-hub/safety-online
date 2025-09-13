import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Delete cookie
  const cookieStore = await cookies();
  cookieStore.delete("seller-auth-token");

  return NextResponse.json({ message: "Logged out successfully" });
}
