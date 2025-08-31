"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';

// Dynamically import the heavy three scene to avoid SSR issues
const GhibliScene = dynamic(() => import('./scene').then((mod) => mod.default), { ssr: false });

export default function Page() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
        <GhibliScene />
      </Canvas>
    </div>
  );
}