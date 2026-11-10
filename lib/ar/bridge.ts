import type { BufferGeometry } from 'three';

/** Lets UI outside the Canvas (the AR button) reach the geometry that SignMesh is currently showing. */
let live: BufferGeometry | null = null;
export const setLiveGeometry = (g: BufferGeometry | null) => { live = g; };
export const getLiveGeometry = () => live;
