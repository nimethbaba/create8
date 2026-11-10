/** A framed 3D render. Decorative, so the alt text is empty and the card is skipped by screen readers. */
export function FloatCard({ src, w, h, className = '' }: { src: string; w: number; h: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-[0_24px_60px_-18px_rgba(0,0,0,.9)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={w} height={h} decoding="async" draggable={false} className="block h-auto w-full select-none" />
    </div>
  );
}
