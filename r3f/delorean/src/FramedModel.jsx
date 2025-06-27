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

    camera.position.set(0, 2, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [Model, camera]);

  useFrame((_, delta) => {
    if (wrapperRef.current) {
      wrapperRef.current.rotation.y += delta * options.rotateSpeed || 0.001;
    }
  });

  // slide in from off screen position,x-axis when Model changes
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.position.x = -10; // Start off-screen
      wrapperRef.current.rotation.y = 0; // Reset rotation
      wrapperRef.current.scale.set(0.1, 0.1, 0.1); // Start small
      const targetPosition = new Vector3(0, 0, 0);
      const targetScale = new Vector3(1, 1, 1);

      // Animate to target position and scale
      const duration = 1000; // milliseconds
      let startTime = null;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        wrapperRef.current.position.lerp(targetPosition, t);
        wrapperRef.current.scale.lerp(targetScale, t);

        if (t < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [Model]);

  return (
    <>
      <group ref={wrapperRef}>
        <group ref={modelRef}>
          <Model />
        </group>
      </group>
    </>
  );
}
