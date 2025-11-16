import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Input, Heading, Text, toast } from "@medusajs/ui"
import { useState } from "react"
import { useParams } from "react-router-dom"

const ProductMediaUrlWidget = () => {
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { id } = useParams()

  const handleAddImage = async () => {
    if (!imageUrl.trim()) {
      toast.error("Error", {
        description: "Please enter a valid image URL",
      })
      return
    }

    // Validate URL
    try {
      new URL(imageUrl)
    } catch {
      toast.error("Error", {
        description: "Invalid URL format",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/admin/products/${id}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            images: [{ url: imageUrl }],
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add image")
      }

      toast.success("Success", {
        description: "Image URL added successfully! Refresh the page to see it.",
      })
      
      setImageUrl("")
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error adding image:", error)
      toast.error("Error", {
        description: "Failed to add image URL. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="p-4 mb-4">
      <div className="flex flex-col gap-4">
        <div>
          <Heading level="h2" className="mb-2">
            Add Image from URL
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Add product images by pasting external URLs (no upload needed)
          </Text>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleAddImage}
            disabled={loading || !imageUrl.trim()}
            variant="secondary"
          >
            {loading ? "Adding..." : "Add Image"}
          </Button>
        </div>

        <div className="text-xs text-ui-fg-muted">
          <p className="font-semibold mb-1">Examples:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>https://your-domain.com/images/product.jpg</li>
            <li>https://raw.githubusercontent.com/user/repo/main/image.png</li>
            <li>Any publicly accessible image URL</li>
          </ul>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductMediaUrlWidget

