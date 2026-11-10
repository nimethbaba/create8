# CRE 8 — 3D Sign Configurator (MVP scaffold)

```bash
npm install     # postinstall copies Three's typeface fonts into /public/fonts
npm run dev     # landing page: http://localhost:3000  ·  designer: /design  ·  admin: /admin
```

## Pipeline (Tech Architecture §1) → files
| Stage | What | Where |
|---|---|---|
| 01 Input | text, font, SVG upload (+ validation) | `store/useSignStore.ts`, `components/configurator/ControlsSidebar.tsx`, `lib/svgSafety.ts` |
| 02 Vector | glyph layout / SVGLoader → cleaned contours | `lib/geometry.ts` (`textToContours`, `svgToContours`) |
| 03 Scene | `ExtrudeGeometry` + PBR + lights | `useSignGeometry.ts`, `SignMesh.tsx`, `SignStage.tsx`, `lib/materials.ts` |
| 04 Output | bloom pass, metrics → live price | `BloomEffect.tsx`, `lib/geometry.ts` (`computeMetrics`), `lib/pricing.ts` |

## Update strategy
- Geometry params (text/font/size/spacing/depth/SVG) → rebuild `ExtrudeGeometry` (deferred, old one disposed).
- Finish / colour / illumination → plain material props. No geometry or material re-creation.
- Price = f(metrics, finish, lighting) — recomputed instantly, geometry untouched.

## Cart & order flow
`Add to cart` (thumbnail snapshot + config + metrics) → `/cart` (persisted, qty, bulk discount, duplicate & edit)
→ `/checkout` → `POST /api/orders` → `/order/[id]` (Configured → Manufacturing → Quality Check → Shipped).
- Client never sends prices. Server re-prices with `lib/pricing.ts`; **text signs are re-measured server-side** (`lib/serverMetrics.ts`);
  SVG signs use sanity-checked client metrics and are flagged `needsReview`.
- Orders live in an in-memory Map (`lib/orders.ts`) — demo only. Payment is a stub — swap for Stripe Checkout + webhook.

## Admin & production (DXF / SVG / BOM)
Set `ADMIN_PASSWORD` in `.env.local` (see `.env.example`), then open `/admin` (HTTP Basic auth, user `admin`; disabled if unset).
- `/admin` order list → `/admin/orders/[id]`: ship-to, per-item flat-profile preview, **DXF** + **SVG** download, per-item and order-level **BOM CSV**, "Mark as next stage" (feeds the customer tracker).
- Cut files are built in the admin's browser from the saved config with the same pipeline as the viewer (`lib/production/fromConfig.ts`).
  Millimetres, origin at bottom-left, layers `CUT_INNER` (cut first) and `CUT_OUTER`, closed polylines, DXF R12 for max CAM/laser compatibility.
- Tool / kerf offset (`loops.ts`) refuses to emit a file when the offset would collapse a counter, self-intersect, or fuse neighbouring letters.
- BOM stock sizes, LED strip, PSU sizes and densities in `lib/production/bom.ts` are **placeholders**.
- `npm run test:production` compiles the pure production modules in strict mode and runs the DXF/offset/SVG/BOM tests.

## AR preview
Sidebar → **View on my wall (AR)**: exports the current sign as a real-size GLB (`lib/ar/exportGlb.ts`, metres, back at z=0),
uploads it (`POST /api/ar`, validated by `lib/ar/glb.ts`, 8 MB cap, 10/hour/IP, 24 h TTL), and shows a QR code → `/ar/[id]`
(`<model-viewer>`: WebXR / Scene Viewer / Quick Look, `ar-placement="wall"`, `ar-scale="fixed"`).
- AR needs HTTPS and a URL the phone can reach — use a tunnel (Cloudflare Tunnel / ngrok) or deploy to test on a device.
- Not carried into AR: bloom glow, halo backlight, procedural grain. Front-lit / edge-lit become emissive materials.
- Hosting is in-memory (`lib/ar/store.ts`) — swap for S3 / Vercel Blob with a 24 h lifecycle rule.

## Public pages
`/` landing · `/gallery` · `/about` · `/contact` (shared header/footer in `components/landing/`), designer at `/design`.
- Edit your details in **`lib/site.ts`** (email, phone, address, hours, story). Empty values are hidden; with no email the Contact page shows a "coming soon" card.
- Gallery "design ideas" come from `lib/presets.ts`; each opens `/design?preset=<id>` with that design loaded. Add photos of real finished signs in `lib/gallery.ts` (+ `public/gallery/`).
- Contact form opens the visitor's email app (mailto). Swap for an API route + email provider when ready.

## Look & feel
- Titles on the public pages use **Special Gothic** (`@fontsource-variable/special-gothic`, self-hosted); body text stays Roboto Mono.
- Landing page 3D renders live in `public/images/` (`ring`, `orb`, `cube`). `HeroStage.tsx` places them; `ParallaxField.tsx` makes them follow the mouse
  (`depth` = pixels moved, `tilt` = degrees — bigger means "closer"). Off for touch screens and reduced-motion users.

## Not built yet
real payments/DB, auth + admin order screen, emails, TTF/OTF fonts + true kerning (opentype.js), Pantone/RAL, server-side SVG sanitising.
