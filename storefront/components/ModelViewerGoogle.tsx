"use client";

import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export function ModelViewerGoogle({ 
  modelUrl, 
  fallbackImage 
}: { 
  modelUrl?: string;
  fallbackImage?: string;
}) {
  useEffect(() => {
    // Load Google's model-viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  if (!modelUrl) {
    return (
      <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
        {fallbackImage ? (
          <img 
            src={fallbackImage} 
            alt="Product" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No 3D model available</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      <model-viewer
        src={modelUrl}
        alt="3D Product Model"
        auto-rotate
        camera-controls
        ar
        style={{ width: "100%", height: "100%" }}
        loading="eager"
      >
        {fallbackImage && (
          <img slot="poster" src={fallbackImage} alt="Product" />
        )}
      </model-viewer>
    </div>
  );
}

