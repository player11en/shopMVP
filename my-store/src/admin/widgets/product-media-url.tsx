import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Button, Input, Heading, Text, toast, Label } from "@medusajs/ui"
import { useState } from "react"
import { useParams } from "react-router-dom"

const ProductMediaUrlWidget = () => {
  const [imageUrl, setImageUrl] = useState("")
  const [metadataImageUrl, setMetadataImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [metadataLoading, setMetadataLoading] = useState(false)
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
        description: "Image URL added successfully! Refreshing...",
      })
      
      setImageUrl("")
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error adding image:", error)
      toast.error("Error", {
        description: "Failed to add image URL. Try the metadata option below.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToMetadata = async () => {
    if (!metadataImageUrl.trim()) {
      toast.error("Error", {
        description: "Please enter a valid image URL",
      })
      return
    }

    // Validate URL
    try {
      new URL(metadataImageUrl)
    } catch {
      toast.error("Error", {
        description: "Invalid URL format",
      })
      return
    }

    setMetadataLoading(true)

    try {
      // Get current product metadata
      const getResponse = await fetch(`/admin/products/${id}`, {
        credentials: "include",
      })
      
      if (!getResponse.ok) {
        throw new Error("Failed to fetch product")
      }

      const { product } = await getResponse.json()
      const currentMetadata = product.metadata || {}

      // Update product with new metadata
      const updateResponse = await fetch(`/admin/products/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: {
            ...currentMetadata,
            image_url: metadataImageUrl,
          },
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update metadata")
      }

      toast.success("Success", {
        description: "Image URL added to metadata! Your storefront can use this.",
      })
      
      setMetadataImageUrl("")
    } catch (error) {
      console.error("Error updating metadata:", error)
      toast.error("Error", {
        description: "Failed to add to metadata. Please try again.",
      })
    } finally {
      setMetadataLoading(false)
    }
  }

  return (
    <Container className="p-4 mb-4">
      <div className="flex flex-col gap-6">
        {/* Primary method: Add to product images */}
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
        </div>

        {/* Fallback method: Add to metadata */}
        <div className="flex flex-col gap-4 pt-4 border-t">
          <div>
            <Heading level="h3" className="mb-2">
              Alternative: Add to Metadata
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Store image URL in metadata (fallback option, similar to 3D/video URLs)
            </Text>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="metadata-image-url">Image URL (Metadata)</Label>
            <div className="flex gap-2">
              <Input
                id="metadata-image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={metadataImageUrl}
                onChange={(e) => setMetadataImageUrl(e.target.value)}
                className="flex-1"
                disabled={metadataLoading}
              />
              <Button
                onClick={handleAddToMetadata}
                disabled={metadataLoading || !metadataImageUrl.trim()}
                variant="secondary"
              >
                {metadataLoading ? "Saving..." : "Save to Metadata"}
              </Button>
            </div>
            <Text size="xsmall" className="text-ui-fg-muted">
              This adds <code className="bg-ui-bg-subtle px-1 rounded">image_url</code> to product metadata
            </Text>
          </div>
        </div>

        {/* Examples */}
        <div className="text-xs text-ui-fg-muted pt-4 border-t">
          <p className="font-semibold mb-1">URL Examples:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>https://playereleven.de/projekte/images/character.webp</li>
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

