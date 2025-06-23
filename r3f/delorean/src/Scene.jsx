import { OrbitControls, Environment } from '@react-three/drei'
import { Model } from './Model'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function Scene() {

    const car = useRef(null);

    useFrame((state, delta) => {
        if (car.current) {
            car.current.rotation.y += delta * 0.5; // Rotate the car
        }
    });

  return (
    <>
      {/* Lights */}
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

      {/* Model with castShadow */}
      <group position={[0, 0, 0]} castShadow>
        <Model ref={car} />
      </group>

      {/* Ground plane to receive shadow */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[1, -1.72, 0]}>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.1} />
      </mesh>

      {/* Optional HDRI lighting */}
      <Environment preset="sunset" />

      <OrbitControls />
    </>
  )
}
