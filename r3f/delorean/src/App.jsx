import './App.css'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { PCFSoftShadowMap } from 'three'
import { useState, useEffect } from 'react'
import { Delorean } from './Cars/Delorean'
import { BatMobile } from './Cars/Batmobile'
import { Lightning } from './Cars/Lightning'
import { Mini } from './Cars/Mini'
import { ModelSelector } from './ModelSelector';

const cars = [Delorean, BatMobile, Lightning, Mini];

function App() {
  const [index, setIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIndex((prev) => (prev + 1) % cars.length);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  const Car = cars[index];
  const goNext = () => setIndex((prev) => (prev + 1) % cars.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + cars.length) % cars.length);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        shadowMap={{ type: PCFSoftShadowMap }}
        camera={{ position: [10, 5, 15], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <color attach="background" args={['#d2d2d2']} />
        <Scene Car={Car} />
      </Canvas>

      <ModelSelector
        models={cars}
        selectedIndex={index}
        onSelect={setIndex}
      />
    </div>
  );
}

export default App;
