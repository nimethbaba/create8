'use client';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { registerCapture } from '@/lib/snapshot';

/**
 * Registers a capture function. It renders the scene directly (so bloom is not in the thumbnail)
 * and reads the canvas in the same task — no need for preserveDrawingBuffer.
 */
export function SnapshotBridge({ width = 360 }: { width?: number }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    registerCapture(() => {
      try {
        gl.render(scene, camera);
        const src = gl.domElement;
        const out = document.createElement('canvas');
        out.width = width;
        out.height = Math.round((src.height / src.width) * width);
        out.getContext('2d')!.drawImage(src, 0, 0, out.width, out.height);
        return out.toDataURL('image/jpeg', 0.75);
      } catch {
        return null;
      }
    });
    return () => registerCapture(null);
  }, [gl, scene, camera, width]);
  return null;
}
