import './App.css';
import { Canvas } from '@react-three/fiber';
import { PCFSoftShadowMap } from 'three';
import { useRef, useCallback } from 'react';
import { Delorean } from './Cars/Delorean';
import { BatMobile } from './Cars/Batmobile';
import { Lightning } from './Cars/Lightning';
import { Mini } from './Cars/Mini';
import { ModelSelector } from './ModelSelector';
import { Environment, OrbitControls } from '@react-three/drei';
import { FramedModel } from './FramedModel';
import { useCarStore } from './stores/carStore';

const Cars = [Delorean, BatMobile, Lightning, Mini];

export default function App() {
  const carSelectorRef = useRef(null);

  /* ---- Zustand hooks ---- */
  const index     = useCarStore((s) => s.index);
  const setIndex  = useCarStore((s) => s.setIndex);

  const onSelect = useCallback(
    (newIdx) => {
      setIndex(newIdx);
      carSelectorRef.current?.scrollToIndex(newIdx);
    },
    [setIndex]
  );

  const Car = Cars[index];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        shadowMap={{ type: PCFSoftShadowMap }}
        camera={{ position: [10, 5, 15], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <color attach="background" args={['#d2d2d2']} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={0.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-radius={14}
          shadow-bias={-0.001}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Environment preset="sunset" />
        <FramedModel Model={Car} options={{rotateSpeed: 0, showLogo: true, mainModel: true}} />
        <OrbitControls />
      </Canvas>

      <ModelSelector
        ref={carSelectorRef}
        models={Cars}
        onSelect={onSelect}
      />

      <img
        src={`/cars/${Car.name}.png`}        /* or a fixed logo file */
        alt={`${Car.name} logo`}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 200,
          height: 'auto',
          pointerEvents: 'none',                    // let clicks pass through
          zIndex: 20,                               // above the selector strip
        }}
      />
    </div>
  );
}
