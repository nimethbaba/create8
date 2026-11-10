'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls } from '@react-three/drei';
import { useSignStore } from '@/store/useSignStore';
import { SignMesh } from './SignMesh';
import { SignStage } from './SignStage';
import { BloomEffect } from './BloomEffect';
import { SnapshotBridge } from './SnapshotBridge';

export default function SignViewport() {
  const lit = useSignStore((s) => s.light.mode !== 'off');
  const error = useSignStore((s) => s.error);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows="soft"                       // THREE.PCFSoftShadowMap
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1.6], fov: 35, near: 0.05, far: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b0b0d']} />
        <Suspense fallback={null}>
          <SignStage />
          {/* Re-frames the camera whenever the sign's size changes (text, size, SVG width) */}
          <Bounds fit observe margin={1.5}>
            <SignMesh />
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} minDistance={0.4} maxDistance={6} maxPolarAngle={Math.PI * 0.6} />
        <SnapshotBridge />
        {lit && <BloomEffect />}
      </Canvas>

      {error && (
        <div className="absolute left-4 top-16 rounded bg-red-900/80 px-3 py-2 text-sm text-red-100">{error}</div>
      )}
    </div>
  );
}
