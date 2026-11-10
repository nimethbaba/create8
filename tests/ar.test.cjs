const assert = require('assert');
const { validateGlb, MAX_GLB_BYTES } = require('../.test-build/ar/glb.js');
const { ArStore } = require('../.test-build/ar/store.js');
const ok = (m) => console.log('  ✓', m);

/** Build a GLB with the given JSON object and a small BIN chunk. */
function makeGlb(json, { lengthDelta = 0, magic = 0x46546c67, version = 2, jsonType = 0x4e4f534a } = {}) {
  let js = Buffer.from(JSON.stringify(json)); while (js.length % 4) js = Buffer.concat([js, Buffer.from(' ')]);
  const bin = Buffer.alloc(8);
  const total = 12 + 8 + js.length + 8 + bin.length;
  const b = Buffer.alloc(total);
  b.writeUInt32LE(magic, 0); b.writeUInt32LE(version, 4); b.writeUInt32LE(total + lengthDelta, 8);
  b.writeUInt32LE(js.length, 12); b.writeUInt32LE(jsonType, 16); js.copy(b, 20);
  const o = 20 + js.length; b.writeUInt32LE(bin.length, o); b.writeUInt32LE(0x004e4942, o + 4); bin.copy(b, o + 8);
  return new Uint8Array(b);
}
const good = { asset: { version: '2.0' }, buffers: [{ byteLength: 8 }], scenes: [{ nodes: [] }] };

// ---- GLB validation
assert.strictEqual(validateGlb(makeGlb(good)), null);
assert.match(validateGlb(makeGlb(good, { magic: 0x12345678 })), /magic/);
assert.match(validateGlb(makeGlb(good, { version: 1 })), /2\.0/);
assert.match(validateGlb(makeGlb(good, { lengthDelta: 4 })), /length/);
assert.match(validateGlb(makeGlb(good, { jsonType: 0x004e4942 })), /JSON/);
assert.match(validateGlb(makeGlb({ asset: { version: '1.0' } })), /2\.0/);
assert.match(validateGlb(new Uint8Array(10)), /small/);
assert.match(validateGlb(makeGlb(good), 40), /larger/);
assert.match(validateGlb(makeGlb({ ...good, images: [{ uri: 'https://evil.example/track.png' }] })), /External/);
assert.match(validateGlb(makeGlb({ ...good, buffers: [{ uri: 'file:///etc/passwd', byteLength: 1 }] })), /External/);
assert.strictEqual(validateGlb(makeGlb({ ...good, images: [{ uri: 'data:image/png;base64,AAAA' }] })), null, 'data: URIs are fine');
// JSON chunk that claims to extend past the file
const lying = makeGlb(good); new DataView(lying.buffer).setUint32(12, 9999999, true);
assert.match(validateGlb(lying), /JSON chunk/);
// not-JSON content
const junk = makeGlb(good); junk[22] = 0xff; junk[23] = 0xff;
assert.match(validateGlb(junk), /parsed/);
// a very large JSON chunk is refused before parsing
const bigJson = makeGlb({ ...good, extras: 'x'.repeat(1.2 * 1024 * 1024) });
assert.match(validateGlb(bigJson), /too large/);
ok('GLB validation: magic, version, length header, chunk type/size, asset version, external URIs, size cap, bad JSON');

// ---- store
let clock = 1_000_000;
const mk = (o = {}) => new ArStore({ ttlMs: 1000, maxEntries: 3, maxTotalBytes: 100, perIpLimit: 2, perIpWindowMs: 5000, now: () => clock, ...o });
const data = (n) => new Uint8Array(n);

let s = mk();
const r1 = s.put('1.1.1.1', data(10)); assert.ok(r1.ok && /^[0-9a-f-]{36}$/.test(r1.id));
assert.strictEqual(s.get(r1.id).length, 10);
assert.strictEqual(s.get('nope'), null);
clock += 999; assert.ok(s.get(r1.id)); clock += 1; assert.strictEqual(s.get(r1.id), null, 'expires exactly at ttl');
assert.strictEqual(s.stats().bytes, 0, 'expired entry freed from byte total');
ok('store: put/get, unknown id, TTL expiry frees bytes');

s = mk(); clock = 0;
assert.ok(s.put('a', data(1)).ok); assert.ok(s.put('a', data(1)).ok);
const lim = s.put('a', data(1)); assert.ok(!lim.ok && lim.status === 429);
assert.ok(s.put('b', data(1)).ok, 'other IP unaffected');
clock += 5001; assert.ok(s.put('a', data(1)).ok, 'window slides');
ok('store: per-IP rate limit (429), independent per IP, window resets');

s = mk({ perIpLimit: 99 }); clock = 0;
const ids = [1, 2, 3, 4].map(() => s.put('x', data(10)).id);
assert.strictEqual(s.get(ids[0]), null, 'oldest evicted at maxEntries'); assert.ok(s.get(ids[3]));
assert.strictEqual(s.stats().entries, 3);
const big = s.put('x', data(90)); assert.ok(big.ok);
assert.ok(s.stats().bytes <= 100, 'byte cap respected: ' + s.stats().bytes);
const tooBig = s.put('x', data(101)); assert.ok(!tooBig.ok && tooBig.status === 507);
ok('store: evicts oldest by count and by total bytes, rejects single item over the cap');
