import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeading, PageShell } from '@/components/landing/PageShell';
import { ContactForm } from '@/components/landing/ContactForm';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch about a quote, help with your design, or an existing order.',
};

export default function ContactPage() {
  const details = [
    SITE.contactEmail && { label: 'Email', node: <a className="underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> },
    SITE.phone && { label: 'Phone', node: <a className="underline" href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`}>{SITE.phone}</a> },
    SITE.address && { label: 'Address', node: <span className="whitespace-pre-line">{SITE.address}</span> },
    SITE.hours && { label: 'Hours', node: <span className="whitespace-pre-line">{SITE.hours}</span> },
  ].filter(Boolean) as { label: string; node: React.ReactNode }[];

  return (
    <PageShell>
      <PageHeading eyebrow="Contact" title="Talk to us">
        Need a quote, help with your design, or news on an order? Send a message.
      </PageHeading>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-20 pt-6 md:grid-cols-[1fr_320px]">
        <section aria-labelledby="send">
          <h2 id="send" className="sr-only">Send a message</h2>
          {SITE.contactEmail ? (
            <ContactForm to={SITE.contactEmail} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-6">
              <h3 className="font-semibold">Contact details are coming soon</h3>
              <p className="mt-2 text-sm text-neutral-300">In the meantime, you can design your sign and see the price right away.</p>
              <Link href={SITE.designPath} className="mt-4 inline-block rounded-full bg-[#ff2d6f] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#ff5c8d]">Open the designer</Link>
            </div>
          )}
        </section>

        <aside aria-labelledby="details" className="space-y-5">
          <h2 id="details" className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Details</h2>
          {details.length > 0 ? (
            <dl className="space-y-4 text-sm">
              {details.map((d) => (
                <div key={d.label}><dt className="text-neutral-500">{d.label}</dt><dd className="mt-0.5 text-neutral-200">{d.node}</dd></div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-neutral-500">No public contact details yet.</p>
          )}
          <p className="rounded-lg border border-white/10 p-4 text-sm text-neutral-300">
            Already ordered? Use the order link you were given to follow your sign&apos;s progress.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
