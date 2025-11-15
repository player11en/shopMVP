"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Loading component
function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading 3D model...</p>
      </div>
    </div>
  );
}

// 3D Model component
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  // Auto-rotate the model
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={1} 
      position={[0, 0, 0]}
    />
  );
}

// Main 3D Viewer Component
export function Model3DViewer({ 
  modelUrl, 
  fallbackImage 
}: { 
  modelUrl?: string;
  fallbackImage?: string;
}) {
  if (!modelUrl) {
    // Show fallback image if no 3D model
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
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Model url={modelUrl} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Note: To preload models, use: useGLTF.preload('/path/to/model.glb')

