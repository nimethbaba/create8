const assert = require('assert');
const L = require('../.test-build/production/loops.js'), D = require('../.test-build/production/dxf.js'), S = require('../.test-build/production/svg.js'), B = require('../.test-build/production/bom.js');
const rect = (x0,y0,x1,y1) => [{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
const approx = (a,b,e=1e-3) => assert.ok(Math.abs(a-b)<=e, `${a} !≈ ${b}`);
const ok = (m) => console.log('  ✓', m);

// 1. orientation
const sq = { outer: rect(0,0,100,50).reverse(), holes: [rect(40,15,60,35)] };
const o = L.orient([sq])[0];
assert.ok(L.signedArea(o.outer) > 0); assert.ok(L.signedArea(o.holes[0]) < 0);
approx(L.netArea([sq]), 100*50-20*20); ok('orientation normalised (outer CCW, hole CW) + net area');

// 2. DXF strict structural parse
const dxf = D.contoursToDxf([sq]);
const lines = dxf.split('\n'); assert.strictEqual(lines.pop(), '');
assert.strictEqual(lines.length % 2, 0);
const pairs = []; for (let i=0;i<lines.length;i+=2) { assert.ok(/^\s*\d+$/.test(lines[i]), 'group code: '+lines[i]); pairs.push([+lines[i], lines[i+1]]); }
assert.deepStrictEqual(pairs.at(-1), [0,'EOF']);
assert.strictEqual(pairs.filter(p=>p[0]===0&&p[1]==='SECTION').length, 3);
assert.strictEqual(pairs.filter(p=>p[0]===0&&p[1]==='ENDSEC').length, 3);
const ent = pairs.slice(pairs.findIndex(p=>p[0]===2&&p[1]==='ENTITIES'));
const kinds = ent.filter(p=>p[0]===0).map(p=>p[1]);
assert.strictEqual(kinds.filter(k=>k==='POLYLINE').length, 2);
assert.strictEqual(kinds.filter(k=>k==='VERTEX').length, 8);
assert.strictEqual(kinds.filter(k=>k==='SEQEND').length, 2);
const firstPoly = ent.findIndex(p=>p[0]===0&&p[1]==='POLYLINE');
assert.strictEqual(ent[firstPoly+1][1], 'CUT_INNER');                       // holes cut first
const layers = ent.filter(p=>p[0]===8).map(p=>p[1]);
assert.ok(layers.indexOf('CUT_OUTER') > layers.lastIndexOf('CUT_INNER'));
assert.ok(ent.slice(firstPoly, firstPoly+9).some(p=>p[0]===70&&p[1]==='1')); // closed flag
const defined = pairs.map((p,i)=>p[0]===0&&p[1]==='LAYER'?pairs[i+1][1]:null).filter(Boolean);
for (const l of new Set(layers)) assert.ok(defined.includes(l), 'layer defined '+l);
const ext = pairs.findIndex(p=>p[1]==='$EXTMAX'); approx(+pairs[ext+1][1], 100); approx(+pairs[ext+2][1], 50);
ok(`DXF structure valid (${kinds.length} entities, layers defined, holes first, closed, extents)`);

// 3. offsets
let r = L.offsetContours([sq], 1.5); assert.strictEqual(r.error, null);
let b = L.bounds(r.contours); approx(b.width, 103); approx(b.height, 53);
const h = r.contours[0].holes[0]; approx(Math.max(...h.map(p=>p.x))-Math.min(...h.map(p=>p.x)), 17);
assert.strictEqual(L.offsetContours([sq], 0).error, null);
r = L.offsetContours([sq], -1.5); assert.strictEqual(r.error, null); approx(L.bounds(r.contours).width, 97);
ok('offset: outer grows 100→103, hole shrinks 20→17, negative offset works, zero is a no-op');

// 4. refusals
assert.ok(L.offsetContours([{ outer: rect(0,0,100,2), holes: [] }], -1.5).error);
assert.ok(/hole/.test(L.offsetContours([{ outer: rect(0,0,100,50), holes: [rect(10,10,12,12)] }], 1.5).error));
const close = [{ outer: rect(0,0,20,20), holes: [] }, { outer: rect(22,0,42,20), holes: [] }];
assert.ok(/touch/.test(L.offsetContours(close, 1.5).error));
assert.strictEqual(L.offsetContours(close, 0.5).error, null);
ok('refuses bad offsets (thin part collapses, 2 mm hole closes, letters 2 mm apart collide) but accepts 0.5 mm kerf');

// 5. ring (like an "O")
const circ = (r,n=96) => Array.from({length:n},(_,i)=>({x:r*Math.cos(2*Math.PI*i/n), y:r*Math.sin(2*Math.PI*i/n)}));
r = L.offsetContours([{ outer: circ(50), holes: [circ(30)] }], 1.5); assert.strictEqual(r.error, null);
approx(L.bounds(r.contours).width, 103, 0.05); approx(Math.max(...r.contours[0].holes[0].map(p=>p.x)), 28.5, 0.05);
ok('curved ring offsets correctly (r 50→51.5, hole r 30→28.5)');

// 6. SVG
const svg = S.contoursToSvg([sq]);
assert.ok(/width="104\.000mm" height="54\.000mm" viewBox="0 0 104\.000 54\.000"/.test(svg), svg.split('\n')[0]);
assert.ok(svg.includes('id="CUT_INNER"') && svg.includes('id="CUT_OUTER"') && !/NaN|undefined|Infinity/.test(svg));
assert.ok(svg.includes('M2.000 52.000'));
ok('SVG: mm units, viewBox, layer groups, y-flip, no NaN');

// 7. BOM
const metrics = { widthCm: 10.2, heightCm: 5.2, depthCm: 1.0, volumeCm3: 38, surfaceAreaCm2: 120, perimeterCm: 66 };
const contoursCm = [{ outer: rect(0,0,10,5), holes: [rect(4,1.5,6,3.5)] }];
const base = { finish:'matte-acrylic', depthMm:10, lightMode:'edge', lightColorMode:'rgb', kelvin:4000, metrics, qty:3 };
const bom = B.buildItemBom(base, contoursCm);
const by = Object.fromEntries(bom.lines.map(l=>[l.item,l]));
assert.strictEqual(bom.summary.layers, 2);
assert.strictEqual(by['Face / body material'].qty, 1);
approx(bom.summary.ledStripM, 0.66*1.1*3, 0.01); approx(bom.summary.ledWattsPerSign, 0.66*1.1*14.4, 0.1);
assert.strictEqual(bom.summary.psuWatts, 18);
assert.strictEqual(by['Power supply'].qty, 3); assert.ok(by['RGB controller']); assert.match(by['LED strip'].spec, /^RGB/);
assert.strictEqual(by['Wall standoffs'].qty, 4*3);
const unlit = B.buildItemBom({ ...base, lightMode:'off' }, contoursCm);
assert.ok(!unlit.lines.some(l=>/LED|Power|cable|RGB/.test(l.item)) && unlit.summary.psuWatts === null);
const agg = B.aggregateBom([bom, bom]); assert.strictEqual(agg.find(l=>l.item==='Power supply').qty, 6);
const csv = B.bomToCsv([{ item:'=HYPERLINK("x")', spec:'a,"b"', qty:1, unit:'pc' }]);
assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`) && csv.includes('"a,""b"""'));
ok('BOM: layers, sheets, LED m/W, PSU sizing, RGB controller, unlit has no LED parts, aggregation, CSV injection guard');
console.log(JSON.stringify(bom.summary));
