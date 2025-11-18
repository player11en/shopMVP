"use client";

import { useState } from "react";

interface FreeDownloadButtonProps {
  product: any;
  variant?: any;
}

export function FreeDownloadButton({ product, variant }: FreeDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  // Get metadata from product or variant
  const metadata = product.metadata || variant?.product?.metadata || {};
  
  // Check if product is digital - MUST be explicitly marked as digital
  const isDigital = metadata.product_type === 'digital' || metadata.is_digital === 'true';
  
  // Get price from calculated_price (Medusa v2 standard way) - same logic as product page
  let price = 0;
  
  // Check variant first
  if (variant?.calculated_price) {
    price = variant.calculated_price?.calculated_amount || 0;
  } else if (variant?.prices && variant.prices.length > 0) {
    const eurPrice = variant.prices.find((p: any) => p.currency_code?.toLowerCase() === 'eur');
    const usdPrice = variant.prices.find((p: any) => p.currency_code?.toLowerCase() === 'usd');
    const priceObj = eurPrice || usdPrice || variant.prices[0];
    price = priceObj?.amount || 0;
  } 
  // Fallback to product variants
  else if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.calculated_price) {
      price = firstVariant.calculated_price?.calculated_amount || 0;
    } else if (firstVariant.prices && firstVariant.prices.length > 0) {
      const eurPrice = firstVariant.prices.find((p: any) => p.currency_code?.toLowerCase() === 'eur');
      const usdPrice = firstVariant.prices.find((p: any) => p.currency_code?.toLowerCase() === 'usd');
      const priceObj = eurPrice || usdPrice || firstVariant.prices[0];
      price = priceObj?.amount || 0;
    }
  }
  
  // Product is free ONLY if price is explicitly 0
  const hasPrice = variant?.calculated_price || 
                   (variant?.prices && variant.prices.length > 0) || 
                   product.variants?.[0]?.calculated_price ||
                   (product.variants?.[0]?.prices && product.variants[0].prices.length > 0);
  const isFree = hasPrice && price === 0;

  // Get download URL - prioritize 3D model files (GLB/GLTF) over videos (MP4)
  // Uses same detection logic as ProductGallery component
  const getDownloadUrl = () => {
    let model3dUrl = null;
    
    // PRIMARY: Check metadata if available (same logic as product page)
    if (metadata) {
      // Handle metadata as object (most common)
      if (typeof metadata === 'object' && !Array.isArray(metadata)) {
        // Try direct access first (preferred naming)
        model3dUrl = metadata.model_3d_url || metadata['model_3d_url'] || null;
        
        // Try alternative naming conventions (including admin UI keys)
        if (!model3dUrl) {
          model3dUrl = (metadata as any)?.model3dUrl || 
                      (metadata as any)?.model3DUrl ||
                      (metadata as any)?.model_3d ||
                      (metadata as any)?.['3d_model'] ||  // Admin UI key
                      null;
        }
      }
      
      // Handle metadata as array (if backend returns it that way)
      if (Array.isArray(metadata)) {
        const modelEntry = metadata.find((m: any) => 
          m.key === 'model_3d_url' || 
          m.name === 'model_3d_url' ||
          m.key === 'model3dUrl' ||
          m.name === 'model3dUrl' ||
          m.key === '3d_model' ||  // Admin UI key
          m.name === '3d_model'
        );
        if (modelEntry) {
          model3dUrl = modelEntry.value || modelEntry.data || null;
        }
      }
    }
    
    // WORKAROUND: Extract from description (MODEL_3D:/path/to/model.glb)
    if (!model3dUrl && product.description) {
      const modelMatch = product.description.match(/MODEL_3D:([^\s]+)/i);
      if (modelMatch) {
        model3dUrl = modelMatch[1];
      }
    }
    
    // WORKAROUND: If handle contains "3d", use default model (same as gallery)
    if (!model3dUrl && product.handle?.toLowerCase().includes('3d')) {
      model3dUrl = '/models/Untitled.glb';
    }
    
    // Check if it's a 3D model file (GLB/GLTF)
    if (model3dUrl) {
      const url = model3dUrl.toLowerCase();
      if (url.endsWith('.glb') || url.endsWith('.gltf')) {
        return model3dUrl;
      }
      // Even if not .glb/.gltf, if it's a 3D model URL, use it
      return model3dUrl;
    }
    
    // Check generic download URLs - prefer GLB/GLTF files
    const downloadUrl = metadata?.download_url || 
                        metadata?.download_link || 
                        metadata?.file_url ||
                        null;
    
    if (downloadUrl) {
      const url = downloadUrl.toLowerCase();
      // If it's a 3D model file, use it
      if (url.endsWith('.glb') || url.endsWith('.gltf')) {
        return downloadUrl;
      }
      // If it's not a video file, use it (could be other file types)
      if (!url.endsWith('.mp4') && !url.endsWith('.webm') && !url.endsWith('.mov')) {
        return downloadUrl;
      }
    }
    
    // Don't use video URLs for downloads
    return null;
  };

  const downloadUrl = getDownloadUrl();

  // Debug logging (always show for troubleshooting)
  console.log('🔍 FreeDownloadButton Debug:', {
    isFree,
    isDigital,
    hasDownloadUrl: !!downloadUrl,
    downloadUrl,
    metadata,
    price,
    hasPrice,
    shouldShow: isFree && isDigital,
  });

  // STRICT RULES: Download button ONLY shows if:
  // 1. Product is FREE (price === 0) AND
  // 2. Product is DIGITAL (product_type === 'digital')
  // 
  // Download URL is optional - if missing, we'll show a message
  // Does NOT show for:
  // - Paid products (even if digital - must pay first)
  // - Physical products (even if free and has 3D model - 3D is just for preview)
  const shouldShow = isFree && isDigital;
  
  if (!shouldShow) {
    return null;
  }
  
  // If no download URL, show a message instead of download button
  if (!downloadUrl) {
    return (
      <div className="mt-4 p-4 rounded-md" style={{ backgroundColor: '#FBF7F1', border: '1px solid #C7BFB6' }}>
        <p className="text-sm text-center" style={{ color: '#7A2E2C' }}>
          <i className="fas fa-info-circle mr-2"></i>
          Free digital product - Download link will be available after adding to cart
        </p>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    setMessage("");

    try {
      // For direct file downloads, create a temporary link and click it
      if (downloadUrl.startsWith('/') || downloadUrl.startsWith('http')) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setMessage("Download started!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Download link not available");
      }
    } catch (error: any) {
      setMessage("Download failed. Please try again.");
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ backgroundColor: 'var(--darkerblue)', color: 'white' }}
      >
        {downloading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Downloading...
          </>
        ) : (
          <>
            <i className="fas fa-download mr-2"></i>
            Download Free
          </>
        )}
      </button>
      {message && (
        <p className={`mt-2 text-sm text-center ${message.includes('started') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-2 text-sm text-center" style={{ color: 'var(--browngrey)' }}>
        <i className="fas fa-gift mr-1"></i>
        Free digital product - No account or payment required
      </p>
    </div>
  );
}

