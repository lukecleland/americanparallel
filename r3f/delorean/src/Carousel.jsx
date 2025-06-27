// Carousel.jsx ---------------------------------------------------------------
import { Suspense, useState, useCallback } from 'react'
import { useTransition, a } from '@react-spring/three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import FramedModel from './FramedModel'   // <- your component below
import CarModel   from './models/Car'
import PlaneModel from './models/Plane'
import BikeModel  from './models/Bike'

const models = [CarModel, PlaneModel, BikeModel]

export default function Carousel() {
  const [index, setIndex] = useState(0)
  const [dir, setDir]   = useState(1)   //  1 = next ➡️ , -1 = prev ⬅️

  // change index with wrap-around
  const step = useCallback((d) => {
    setDir(d)
    setIndex((i) => (i + d + models.length) % models.length)
  }, [])

  const transitions = useTransition(index, {
    key: index,
    initial: { position: [0, 0, 0] },
    from:    { position: [4 * dir, 0, 0], opacity: 0 },
    enter:   { position: [0, 0, 0],       opacity: 1 },
    leave:   { position: [-4 * dir, 0, 0],opacity: 0 },
    config:  { mass: 1, tension: 170, friction: 26 },
  })

  return (
    <>
      <button className="nav prev" onClick={() => step(-1)}>‹</button>
      <button className="nav next" onClick={() => step( 1)}>›</button>

      <Canvas shadows camera={{ position: [0, 2, 10], fov: 50 }}
              style={{ width: '100vw', height: '100vh', background: '#fff' }}>
        <ambientLight intensity={0.4} />
        <directionalLight castShadow position={[5, 10, 5]} intensity={1.2} />
        <Environment preset="sunset" />

        {transitions((style, i) => {
          const Model = models[i]
          return (
            <a.group position={style.position} /* opacity if you want: style.opacity */
                     castShadow receiveShadow>
              <Suspense fallback={null}>
                <FramedModel Model={Model} options={{ rotateSpeed: 0.2 }} />
              </Suspense>
            </a.group>
          )
        })}

        <OrbitControls />
      </Canvas>
    </>
  )
}
