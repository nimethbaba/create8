'use client';
import { useEffect, useMemo } from 'react';
import { useSignStore } from '@/store/useSignStore';
import { useSignGeometry } from './useSignGeometry';
import { getFinishProps } from '@/lib/materials';
import { getLedColor } from '@/lib/lighting';
import { makeStreakTexture } from '@/lib/textures';
import { CM_TO_M, STANDOFF_M } from '@/lib/constants';
import { setLiveGeometry } from '@/lib/ar/bridge';

/**
 * The extruded sign. Geometry only rebuilds when text/font/depth/SVG change (see useSignGeometry);
 * finish, colour and illumination are plain props on the materials, so they update in place
 * with no geometry work and no material re-creation.
 */
export function SignMesh() {
  const geometry = useSignGeometry();
  const finish = useSignStore((s) => s.finish);
  const color = useSignStore((s) => s.color);
  const light = useSignStore((s) => s.light);

  const textures = useMemo(() => ({ brushed: makeStreakTexture('brushed'), wood: makeStreakTexture('wood') }), []);
  useEffect(() => () => { textures.brushed.dispose(); textures.wood.dispose(); }, [textures]);

  const base = getFinishProps(finish, color, textures);
  const led = getLedColor(light);

  // Front-lit → faces glow. Edge-lit → side walls glow (neon edge). Halo → handled by lights in <SignStage/>.
  const face = {
    ...base,
    emissive: light.mode === 'front' ? led : '#000000',
    emissiveIntensity: light.mode === 'front' ? light.intensity : 0,
  };
  const side = {
    ...base,
    emissive: light.mode === 'edge' ? led : '#000000',
    emissiveIntensity: light.mode === 'edge' ? light.intensity : 0,
  };

  // expose the current geometry to the AR export button (which lives outside the Canvas)
  useEffect(() => {
    setLiveGeometry(geometry);
    return () => setLiveGeometry(null);
  }, [geometry]);

  if (!geometry) return null;

  return (
    <group position={[0, 0, STANDOFF_M]} scale={CM_TO_M}>
      <mesh geometry={geometry} castShadow receiveShadow>
        {/* ExtrudeGeometry groups: 0 = front/back caps, 1 = side walls */}
        <meshPhysicalMaterial key={`${finish}-face`} attach="material-0" {...face} />
        <meshPhysicalMaterial key={`${finish}-side`} attach="material-1" {...side} />
      </mesh>
    </group>
  );
}
