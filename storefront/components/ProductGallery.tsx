"use client";

import { useState } from "react";
import Image from "next/image";
import { Model3DViewer } from "./Model3DViewer";

type ProductGalleryProps = {
  modelUrl?: string | null;
  videoUrl?: string | null;
  images?: Array<{ url: string; id?: string }>;
  productTitle: string;
};

export function ProductGallery({ modelUrl, videoUrl, images, productTitle }: ProductGalleryProps) {
  // Determine initial tab: 3D > Video > Images
  const getInitialTab = () => {
    if (modelUrl) return "3d";
    if (videoUrl) return "video";
    return "images";
  };

  const [activeTab, setActiveTab] = useState<"3d" | "video" | "images">(getInitialTab());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const has3D = !!modelUrl;
  const hasVideo = !!videoUrl;
  const hasImages = images && images.length > 0;
  const selectedImage = images?.[selectedImageIndex];

  // Debug: Log what we received
  if (process.env.NODE_ENV === 'development') {
    console.log('ProductGallery props:', {
      has3D,
      hasVideo,
      hasImages,
      modelUrl,
      videoUrl,
      activeTab
    });
  }

  return (
    <div className="w-full">
      {/* Tab Buttons */}
      {(has3D || hasVideo || hasImages) && (
        <div className="flex gap-2 mb-4 border-b" style={{ borderColor: 'var(--skyblue)' }}>
          {has3D && (
            <button
              onClick={() => setActiveTab("3d")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "3d"
                  ? "border-b-2"
                  : ""
              }`}
              style={
                activeTab === "3d"
                  ? {
                      borderBottomColor: 'var(--darkerblue)',
                      color: 'var(--darkerblue)',
                    }
                  : {
                      color: 'var(--browngrey)',
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== "3d") {
                  e.currentTarget.style.color = 'var(--darkerblue)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "3d") {
                  e.currentTarget.style.color = 'var(--browngrey)';
                }
              }}
            >
              <i className="fas fa-cube mr-2"></i>3D View
            </button>
          )}
          {hasVideo && (
            <button
              onClick={() => setActiveTab("video")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "video"
                  ? "border-b-2"
                  : ""
              }`}
              style={
                activeTab === "video"
                  ? {
                      borderBottomColor: 'var(--darkerblue)',
                      color: 'var(--darkerblue)',
                    }
                  : {
                      color: 'var(--browngrey)',
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== "video") {
                  e.currentTarget.style.color = 'var(--darkerblue)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "video") {
                  e.currentTarget.style.color = 'var(--browngrey)';
                }
              }}
            >
              <i className="fas fa-video mr-2"></i>Video
            </button>
          )}
          {hasImages && (
            <button
              onClick={() => {
                setActiveTab("images");
                setSelectedImageIndex(0); // Reset to first image when switching to images tab
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "images"
                  ? "border-b-2"
                  : ""
              }`}
              style={
                activeTab === "images"
                  ? {
                      borderBottomColor: 'var(--darkerblue)',
                      color: 'var(--darkerblue)',
                    }
                  : {
                      color: 'var(--browngrey)',
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== "images") {
                  e.currentTarget.style.color = 'var(--darkerblue)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "images") {
                  e.currentTarget.style.color = 'var(--browngrey)';
                }
              }}
            >
              <i className="fas fa-images mr-2"></i>Images ({images?.length || 0})
            </button>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--greywhite)' }}>
        {/* 3D Viewer Tab */}
        {activeTab === "3d" && has3D && (
          <div className="w-full h-full">
            <Model3DViewer
              modelUrl={modelUrl!}
              fallbackImage={images?.[0]?.url}
            />
            <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white/80 px-3 py-1 rounded-full">
              🎮 Drag to rotate • Scroll to zoom
            </p>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === "video" && hasVideo && (
          <div className="w-full h-full relative">
            <video
              src={videoUrl!}
              controls
              className="w-full h-full object-contain"
              style={{ backgroundColor: '#000' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && hasImages && selectedImage && (
          <div className="w-full h-full relative">
            {selectedImage.url?.includes("localhost:9000") ? (
              <img
                src={selectedImage.url}
                alt={productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={selectedImage.url}
                alt={productTitle}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        )}

        {/* Fallback if no content */}
        {!has3D && !hasVideo && !hasImages && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No media available</span>
          </div>
        )}
      </div>

      {/* Image Thumbnails (only show when on images tab and multiple images) */}
      {activeTab === "images" && images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-full h-20 rounded overflow-hidden transition-all ${
                selectedImageIndex === index 
                  ? "ring-2 ring-blue-600" 
                  : "hover:ring-2 ring-blue-400"
              }`}
              style={{
                backgroundColor: 'var(--greywhite)',
              }}
            >
              {image.url?.includes("localhost:9000") ? (
                <img
                  src={image.url}
                  alt={`${productTitle} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={image.url}
                  alt={`${productTitle} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 10vw"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

