'use client';
import { Environment, Lightformer } from '@react-three/drei';
import { useSignStore } from '@/store/useSignStore';
import { getLedColor } from '@/lib/lighting';
import { CM_TO_M, STANDOFF_M } from '@/lib/constants';

/** Wall plane + studio/night lighting + halo emitters. */
export function SignStage() {
  const environment = useSignStore((s) => s.environment);
  const light = useSignStore((s) => s.light);
  const widthCm = useSignStore((s) => s.metrics?.widthCm ?? 40);

  const night = environment === 'night';
  const halo = light.mode === 'halo';
  const ledColor = getLedColor(light);
  const spread = (widthCm * CM_TO_M) / 3;

  return (
    <>
      {/* Wall that receives shadows / halo glow */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color={night ? '#16171b' : '#d9d5cd'} roughness={0.95} />
      </mesh>

      {/* Image-based lighting built from lightformers: offline-safe, gives metals something to reflect */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={night ? 0.25 : 3}  position={[0, 3, 4]}   scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={night ? 0.1  : 1.5} position={[-5, 1, 2]} scale={[3, 5, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={night ? 0.1  : 1.5} position={[5, 1, 2]}  scale={[3, 5, 1]} rotation-y={-Math.PI / 2} />
      </Environment>

      <ambientLight intensity={night ? 0.04 : 0.35} />
      <directionalLight
        castShadow
        position={[1.5, 2, 3]}
        intensity={night ? 0.15 : 1.4}
        color={night ? '#8fa6ff' : '#ffffff'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
      />

      {/*
        Halo / backlit: emitters sit between wall and sign and cast shadows, so letters
        occlude them and light only escapes around the letterforms onto the wall.
        3 point lights ≈ 18 shadow passes — keep the count low (mobile!). Intensity scale is
        small because the lights are only centimetres from the wall (inverse-square falloff).
      */}
      {halo &&
        [-spread, 0, spread].map((x) => (
          <pointLight
            key={x}
            castShadow
            position={[x, 0, STANDOFF_M * 0.6]}
            color={ledColor}
            intensity={light.intensity * 0.01}
            distance={2}
            decay={2}
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.001}
          />
        ))}
    </>
  );
}
