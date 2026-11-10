/** Lets non-canvas UI (the Add-to-cart button) grab a thumbnail from the live WebGL canvas. */
let capture: (() => string | null) | null = null;
export const registerCapture = (fn: (() => string | null) | null) => { capture = fn; };
export const captureThumbnail = () => (capture ? capture() : null);
