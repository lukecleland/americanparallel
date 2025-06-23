import './App.css'

import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { PCFSoftShadowMap } from 'three';

function App() {
  return (
   <Canvas
      shadows
      shadowMap={{ type: PCFSoftShadowMap }}
      camera={{ position: [10, 5, 15], fov: 50 }}
      style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      <color attach="background" args={['#ffffff']} />
    <Scene />
  </Canvas>
  )
}

export default App
