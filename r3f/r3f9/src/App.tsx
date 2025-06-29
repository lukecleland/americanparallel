import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, StatsGl, shaderMaterial } from "@react-three/drei";
import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import headsMp4 from "/heads.mp4";

/**
 * Pixel‑grid instanced visualiser – TypeScript, r3f v9, Three r177.
 * – Down‑samples a hidden <video> to w×h, maps each pixel to a cube.
 * – Colours updated each frame via `setColorAt`, with a manual instanceColor buffer.
 */

const InstancedColorMaterial = shaderMaterial(
  {},
  /* vertex */
  `
  attribute vec3 aColor;           // custom per-instance colour
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  /* fragment */
  `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
  `
);

extend({ InstancedColorMaterial });
({ InstancedColorMaterial });

interface PixelGridProps {
  w: number;
  h: number;
  scale?: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function PixelGrid({ w, h, scale = 1, videoRef, canvasRef }: PixelGridProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(scale, scale, scale),
    [scale]
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const colors = new Float32Array(w * h * 3);
    const attr = new THREE.InstancedBufferAttribute(colors, 3);
    mesh.instanceColor = attr;
    mesh.geometry.setAttribute("aColor", attr);
  }, [w, h]);

  useFrame(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let idx = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++, idx++) {
        const k = idx * 4;

        const r = data[k] / 255;
        const g = data[k + 1] / 255;
        const b = data[k + 2] / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // perceived brightness
        const levels = 40; // tweak 4‑16
        const lumQ = Math.round(lum * levels) / levels; // snap to nearest band
        const z = (lumQ - 0.5) * 20; // plate‑like depth

        dummy.position.set((x - w / 2) * scale, (h / 2 - y) * scale, -z);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        color.setRGB(r, g, b);
        meshRef.current.setColorAt(idx, color);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    (
      meshRef.current.instanceColor as THREE.InstancedBufferAttribute
    ).needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, w * h]}>
      {/* @ts-ignore */}
      <instancedColorMaterial />
    </instancedMesh>
  );
}

export default function App() {
  const W = 1280;
  const H = 720;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [muted, setMuted] = useState(true);

  /* boot video once DOM nodes are available */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.src = headsMp4;
    v.loop = true;
    v.muted = true; // autoplay OK
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.play().catch(() => {});

    const unmute = () => {
      v.muted = false;
      v.play().catch(() => {});
      window.removeEventListener("click", unmute);
      window.removeEventListener("touchstart", unmute);
    };
    window.addEventListener("click", unmute);
    window.addEventListener("touchstart", unmute);

    return () => {
      window.removeEventListener("click", unmute);
      window.removeEventListener("touchstart", unmute);
    };
  }, []);

  // Unmute handler
  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {});
    setMuted(false);
  }

  return (
    <>
      <video ref={videoRef} style={{ display: "none" }} width={W} height={H} />
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "none" }}
      />

      <Canvas
        camera={{ position: [20, 10, 80], fov: 60 }}
        style={{ width: "100vw", height: "100vh", display: "block" }}
      >
        <PixelGrid
          w={W}
          h={H}
          scale={0.08}
          videoRef={videoRef}
          canvasRef={canvasRef}
        />
        <OrbitControls makeDefault />
        <StatsGl />
      </Canvas>

      {/* Overlay unmute button if muted */}
      {muted && (
        <div
          onClick={handleUnmute}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.75)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            cursor: "pointer",
            zIndex: 9999,
            userSelect: "none",
          }}
        >
          Click to Unmute
        </div>
      )}
    </>
  );
}
