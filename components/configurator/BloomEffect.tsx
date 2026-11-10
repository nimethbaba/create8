'use client';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
// Post-processing comes from three's own examples (same package/version as the renderer), not three-stdlib:
// the installed three-stdlib build does not export OutputPass. `three` is already in next.config transpilePackages.
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Optical bloom for neon / edge-lit / front-lit glow (Tech Arch §2.2).
 * Mount it only while illumination is on: a useFrame with renderPriority > 0 makes R3F stop
 * auto-rendering, so unmounting hands rendering back to the default pipeline at zero cost.
 * HalfFloat target keeps emissive values > 1 so the bloom threshold only catches lit parts.
 */
export function BloomEffect({ strength = 0.9, radius = 0.6, threshold = 0.85 }) {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloom } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(size.width, size.height, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), strength, radius, threshold);
    composer.addPass(bloom);
    composer.addPass(new OutputPass()); // tone mapping + sRGB, since the scene rendered to a float target
    return { composer, bloom };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => {
    bloom.strength = strength;
    bloom.radius = radius;
    bloom.threshold = threshold;
  }, [bloom, strength, radius, threshold]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => composer.render(), 1);
  return null;
}
