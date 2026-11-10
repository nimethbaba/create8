export const MAX_SVG_BYTES = 1.5 * 1024 * 1024;

/**
 * First-line client-side screening. SVGLoader only reads path data (it never executes
 * scripts), but we still refuse hostile markup. Re-validate + sanitise server-side
 * (e.g. DOMPurify/svgo in an API route) before storing or sending to manufacturing.
 */
export function validateSvg(markup: string): string | null {
  if (markup.length > MAX_SVG_BYTES) return 'SVG is larger than 1.5 MB.';
  if (!/<svg[\s>]/i.test(markup)) return 'File does not look like an SVG.';
  if (/<script|<foreignObject|<iframe|<!ENTITY|javascript:|\son\w+\s*=/i.test(markup)) {
    return 'SVG contains disallowed content (scripts, event handlers or external entities).';
  }
  return null;
}
