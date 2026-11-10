'use client';
import { useDeferredValue, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { FontLoader } from 'three-stdlib';
import { useShallow } from 'zustand/react/shallow';
import { selectGeometryParams, useSignStore } from '@/store/useSignStore';
import { fontUrl } from '@/lib/fonts';
import { computeMetrics, contoursToGeometry, svgToContours, textToContours } from '@/lib/geometry';

/**
 * Pipeline stages 01→04 in one hook:
 *   store params → contours (FontLoader / SVGLoader) → ExtrudeGeometry → metrics → store.
 * Suspends while the font JSON loads (wrap in <Suspense>).
 */
export function useSignGeometry() {
  const params = useSignStore(useShallow(selectGeometryParams));
  const deferred = useDeferredValue(params); // keep typing / dragging sliders responsive
  const font = useLoader(FontLoader, fontUrl(deferred.fontId));
  const setDerived = useSignStore((s) => s.setDerived);

  const result = useMemo(() => {
    try {
      const contours =
        deferred.source === 'svg' && deferred.svgMarkup
          ? svgToContours(deferred.svgMarkup, deferred.svgWidthCm)
          : textToContours(font, deferred);
      if (!contours.length) return { geometry: null, metrics: null, error: null };

      const geometry = contoursToGeometry(contours, deferred.depthMm / 10);
      return { geometry, metrics: computeMetrics(geometry, contours), error: null };
    } catch (e) {
      return { geometry: null, metrics: null, error: e instanceof Error ? e.message : 'Failed to build geometry.' };
    }
  }, [deferred, font]);

  // free GPU buffers of the previous geometry
  useEffect(() => () => result.geometry?.dispose(), [result.geometry]);
  useEffect(() => setDerived(result.metrics, result.error), [result, setDerived]);

  return result.geometry;
}
