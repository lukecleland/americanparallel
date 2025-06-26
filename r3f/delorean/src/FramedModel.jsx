import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import * as THREE from 'three';

export function FramedModel({ Model, options = {} }) {
  const wrapperRef = useRef();
  const modelRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!modelRef.current) return;

    const box = new Box3().setFromObject(modelRef.current);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    modelRef.current.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxDim / (2 * Math.atan((camera.fov * Math.PI) / 360));
    const fitWidthDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360)) / camera.aspect;
    const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

    camera.position.set(0, 5, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [Model, camera]);

  useFrame((_, delta) => {
    if (wrapperRef.current) {
      wrapperRef.current.rotation.y += delta * options.rotateSpeed || 0.001;
    }
  });

  return (
    <>
      {/* {options.showLogo && (
        <mesh position={[0, 2, 0]} scale={[1, 1, 1]}>
          <planeGeometry args={[2, 1]} />
          <meshBasicMaterial
            map={new THREE.TextureLoader().load(`/cars/${Model.name.toString()}.png`)}
            transparent
          />
        </mesh>
      )} */}
     
      <group ref={wrapperRef}>
        <group ref={modelRef}>
          <Model />
        </group>
      </group>
    </>
  );
}
