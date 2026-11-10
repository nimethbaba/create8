'use client';
import { useState } from 'react';

const TOPICS = ['Quote for a custom project', 'Help with my design', 'Question about an order', 'Something else'];
const inputCls = 'w-full rounded border border-neutral-700 bg-neutral-900 p-2.5 text-sm outline-none focus:border-[#ff6f9f] focus-visible:ring-2 focus-visible:ring-[#ff2d6f]/50';
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/**
 * No mail server yet, so this opens the visitor's own email app with the message filled in (mailto:).
 * Swap for a POST /api/contact + email provider (Resend, Postmark…) when you want messages delivered in-page.
 */
export function ContactForm({ to }: { to: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = oneLine(String(f.get('name') ?? '')).slice(0, 100);
    const email = oneLine(String(f.get('email') ?? '')).slice(0, 200);
    const topic = oneLine(String(f.get('topic') ?? ''));
    const message = String(f.get('message') ?? '').slice(0, 2000);
    const body = `${message}\n\n—\n${name}\n${email}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(`${topic} — ${name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-describedby="contact-note">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm"><span className="mb-1 block text-neutral-300">Your name</span>
          <input name="name" required maxLength={100} autoComplete="name" className={inputCls} /></label>
        <label className="block text-sm"><span className="mb-1 block text-neutral-300">Your email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={inputCls} /></label>
      </div>
      <label className="block text-sm"><span className="mb-1 block text-neutral-300">What is this about?</span>
        <select name="topic" className={inputCls}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="block text-sm"><span className="mb-1 block text-neutral-300">Message</span>
        <textarea name="message" required rows={6} maxLength={2000} className={inputCls} /></label>
      <button className="rounded-full bg-[#ff2d6f] px-6 py-3 text-sm font-semibold text-black hover:bg-[#ff5c8d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
        Write to us
      </button>
      <p id="contact-note" className="text-xs text-neutral-500" aria-live="polite">
        {sent
          ? <>Your email app should have opened with the message ready to send. If nothing happened, email us directly at <a className="underline" href={`mailto:${to}`}>{to}</a>.</>
          : 'This opens your email app with the message filled in. Nothing is sent until you press send there.'}
      </p>
    </form>
  );
}
