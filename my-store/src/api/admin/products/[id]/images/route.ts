import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const { images } = req.body as { images: { url: string }[] }

  if (!images || !Array.isArray(images)) {
    return res.status(400).json({
      message: "Images array is required"
    })
  }

  try {
    const productModuleService = req.scope.resolve("product")

    // Get current product to preserve existing images
    const [product] = await productModuleService.listProducts(
      { id },
      { relations: ["images"] }
    )

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    // Add new images to existing ones
    const existingImages = product.images || []
    const newImages = images.map((img, index) => ({
      url: img.url,
      rank: existingImages.length + index
    }))

    // Update product with new images
    await productModuleService.updateProducts(id, {
      images: [...existingImages, ...newImages]
    })

    return res.json({
      message: "Images added successfully",
      images: newImages
    })
  } catch (error: any) {
    console.error("Error adding images:", error)
    return res.status(500).json({
      message: "Failed to add images",
      error: error.message
    })
  }
}

