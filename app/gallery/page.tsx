import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeading, PageShell } from '@/components/landing/PageShell';
import { SignTile, describePreset } from '@/components/landing/SignTile';
import { PRESETS, LIGHT_LABELS } from '@/lib/presets';
import { PROJECTS } from '@/lib/gallery';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Design ideas for custom 3D signs in steel, chrome, acrylic and wood. Open any one in the designer and make it yours.',
};

export default function GalleryPage() {
  return (
    <PageShell>
      <PageHeading eyebrow="Gallery" title="Ideas to start from">
        Pick a style you like and open it in the designer. Change the text, colours, size and lighting until it&apos;s yours.
      </PageHeading>

      {PROJECTS.length > 0 && (
        <section aria-labelledby="finished" className="mx-auto max-w-6xl px-4 py-10">
          <h2 id="finished" className="text-2xl font-bold">Finished signs</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <li key={p.src} className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} loading="lazy" className="h-56 w-full object-cover" />
                <div className="p-4"><h3 className="font-semibold">{p.title}</h3>{p.caption && <p className="mt-1 text-sm text-neutral-300">{p.caption}</p>}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="ideas" className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <h2 id="ideas" className="text-2xl font-bold">Design ideas</h2>
        <p className="mt-1 text-sm text-neutral-400">
          These are quick previews of starting points, not photos of finished signs. The designer shows the real 3D version.
        </p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map((p) => (
            <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900/60">
              <SignTile preset={p} />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-neutral-300">{p.blurb}</p>
                <p className="text-xs text-neutral-500">{describePreset(p, LIGHT_LABELS[p.config.light?.mode ?? 'off'])}</p>
                <Link href={`${SITE.designPath}?preset=${p.id}`}
                  className="mt-auto inline-block pt-2 text-sm font-semibold text-[#ff6f9f] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d6f]">
                  Design one like this <span aria-hidden="true">→</span>
                  <span className="sr-only"> — {p.title}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/10 bg-neutral-950/60">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-14 text-center">
          <h2 className="text-2xl font-bold">Have something else in mind?</h2>
          <p className="text-neutral-300">Start from a blank sign, or upload your own logo.</p>
          <Link href={SITE.designPath} className="inline-block rounded-full bg-[#ff2d6f] px-6 py-3 text-sm font-semibold text-black hover:bg-[#ff5c8d]">Open the designer</Link>
        </div>
      </section>
    </PageShell>
  );
}
