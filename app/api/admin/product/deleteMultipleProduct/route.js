import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function DELETE(request) {
  await dbConnect()

  try {
    const { productIds } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return Response.json({ success: false, message: "Product IDs array is required" }, { status: 400 })
    }

    const result = await Product.deleteMany({
      _id: { $in: productIds },
    })

    return Response.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Delete multiple products error:", error)
    return Response.json({ success: false, message: "Failed to delete products" }, { status: 500 })
  }
}
