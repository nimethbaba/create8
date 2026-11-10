/** Endless ticker (CSS only). The copy is repeated once for the seamless loop and hidden from screen readers. */
export function Marquee({ items }: { items: string[] }) {
  const track = (hidden: boolean) => (
    <ul className="marquee__track" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t} className="flex items-center gap-10 whitespace-nowrap text-sm uppercase tracking-[0.2em] text-neutral-400">
          {t}<span className="text-[#ff2d6f]" aria-hidden="true">▪</span>
        </li>
      ))}
    </ul>
  );
  return <div className="marquee py-5">{track(false)}{track(true)}</div>;
}
