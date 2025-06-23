import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';

function RotatingModel({ Model }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return <Model ref={ref} scale={0.5} />;
}

export const ModelSelector = ({ models, selectedIndex, onSelect }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      zIndex: 10,
    }}>
      {models.map((Model, i) => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          style={{
            width: 80,
            height: 80,
            border: i === selectedIndex ? '2px solid #333' : '2px solid transparent',
            borderRadius: 8,
            overflow: 'hidden',
            cursor: 'pointer',
            background: '#eee',
          }}
        >
          <Canvas camera={{ position: [0, 0, 3] }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} />
            <RotatingModel Model={Model} />
          </Canvas>
        </div>
      ))}
    </div>
  );
};
