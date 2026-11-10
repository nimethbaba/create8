export function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#ff6f9f]">
      <span className="text-neutral-500">{n} /</span> {children}
    </p>
  );
}
