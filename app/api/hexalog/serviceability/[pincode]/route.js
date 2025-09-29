import { checkServiceabilityByPincode } from "@/lib/hexalog";

export async function GET(req, { params }) {
	try {
		const { pincode } = await params;
		if (!pincode) {
			return Response.json(
				{ success: false, message: "pincode is required" },
				{ status: 400 }
			);
		}
		const data = await checkServiceabilityByPincode(pincode);
		return Response.json({ success: true, data });
	} catch (error) {
		return Response.json(
			{
				success: false,
				message: error.message || "Failed to check serviceability",
			},
			{ status: 500 }
		);
	}
}
