import { Canvas } from '@react-three/fiber';
import { FramedModel } from './FramedModel';
import { OrbitControls, Environment } from '@react-three/drei'

export function RotatingThumbnail({ Model }) {
  return (
    <Canvas camera={{ fov: 50 }}>
      <ambientLight />
      <FramedModel Model={Model} options={{rotateSpeed: 0.5}} />
      <Environment preset="sunset" />
    </Canvas>
  );
}
