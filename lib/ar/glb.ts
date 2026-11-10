/**
 * Server-side screening of uploaded GLB files. We can't prove a glTF is harmless, but we can refuse anything
 * that isn't a well-formed binary glTF 2.0, is oversized, or tries to make viewers fetch external URLs
 * (which would let an uploader track whoever opens the AR link).
 */
export const MAX_GLB_BYTES = 8 * 1024 * 1024;
const MAX_JSON_BYTES = 1024 * 1024;
const MAGIC = 0x46546c67;      // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"

export function validateGlb(bytes: Uint8Array, maxBytes = MAX_GLB_BYTES): string | null {
  if (bytes.length < 28) return 'File is too small to be a GLB.';
  if (bytes.length > maxBytes) return `GLB is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`;

  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (v.getUint32(0, true) !== MAGIC) return 'Not a GLB file (bad magic).';
  if (v.getUint32(4, true) !== 2) return 'Only glTF 2.0 is supported.';
  if (v.getUint32(8, true) !== bytes.length) return 'GLB length header does not match the file size.';

  const jsonLen = v.getUint32(12, true);
  if (v.getUint32(16, true) !== CHUNK_JSON) return 'First GLB chunk must be JSON.';
  if (jsonLen > MAX_JSON_BYTES || 20 + jsonLen > bytes.length) return 'GLB JSON chunk is invalid or too large.';

  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(20, 20 + jsonLen)));
  } catch {
    return 'GLB JSON chunk could not be parsed.';
  }
  const g = json as { asset?: { version?: unknown }; images?: { uri?: unknown }[]; buffers?: { uri?: unknown }[] };
  if (g?.asset?.version !== '2.0') return 'Missing glTF asset version 2.0.';
  for (const ref of [...(g.images ?? []), ...(g.buffers ?? [])]) {
    if (ref?.uri !== undefined && !(typeof ref.uri === 'string' && ref.uri.startsWith('data:'))) {
      return 'External resource URIs are not allowed in uploaded models.';
    }
  }
  return null;
}
