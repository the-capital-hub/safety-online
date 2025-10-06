import { NextResponse } from "next/server";
import { estimateShippingCost } from "@/lib/shipping/shipmentUtils";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Verify user authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Parse request body
    const body = await request.json();
    
    // Validate required parameters
    const requiredParams = [
      "pickupPincode", 
      "dropPincode", 
      "length", 
      "width", 
      "height", 
      "weight", 
      "paymentType", 
      "invoiceAmount"
    ];
    
    for (const param of requiredParams) {
      if (!body[param]) {
        return NextResponse.json(
          { success: false, message: `Missing required parameter: ${param}` },
          { status: 400 }
        );
      }
    }

    // Get shipping estimate
    const estimate = await estimateShippingCost(body);

    return NextResponse.json({
      success: true,
      preTax: estimate.preTax,
      tax: estimate.tax,
      total: estimate.total,
      tat: estimate.tat
    });
  } catch (error) {
    console.error("Shipping estimate API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to get shipping estimate" },
      { status: 500 }
    );
  }
}