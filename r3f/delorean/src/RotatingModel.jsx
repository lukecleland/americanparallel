// RotatingModel.jsx (for thumbnail selector)
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { FramedModel } from './FramedModel'; // see below
import { OrbitControls, Environment } from '@react-three/drei'

export function RotatingModel({ Model }) {
  return (
    <Canvas camera={{ fov: 50, near: 0.1, far: 1000 }}>
      <ambientLight />
      <FramedModel Model={Model} options={{rotateSpeed: 0.01}} />
      <Environment preset="sunset" />
      <OrbitControls />
    </Canvas>
  );
}
