/** Upload a GLB for AR hosting; resolves to the preview id. */
export async function uploadGlb(glb: ArrayBuffer): Promise<string> {
  const res = await fetch('/api/ar', { method: 'POST', headers: { 'Content-Type': 'model/gltf-binary' }, body: glb });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Upload failed (HTTP ${res.status}).`);
  return data.id as string;
}
