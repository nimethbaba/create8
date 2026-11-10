'use client';
import { useRef, useState } from 'react';
import { useSignStore } from '@/store/useSignStore';
import { FONT_OPTIONS } from '@/lib/fonts';
import { FINISHES } from '@/lib/materials';
import { validateSvg } from '@/lib/svgSafety';
import type { FinishId, FontId, IlluminationMode } from '@/lib/types';
import { PricePanel } from './PricePanel';
import { ArButton } from './ArButton';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-neutral-800 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</h2>
      {children}
    </section>
  );
}

function Range(props: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex justify-between text-neutral-300">
        <span>{props.label}</span>
        <span className="tabular-nums text-neutral-500">{props.value}{props.unit}</span>
      </div>
      <input
        type="range" className="w-full accent-white"
        min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

const chip = (active: boolean) =>
  `rounded border px-2 py-1.5 text-xs transition ${
    active ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
  }`;

export function ControlsSidebar() {
  const s = useSignStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type && file.type !== 'image/svg+xml') return setUploadError('Only .svg files are supported right now.');
    const markup = await file.text();
    const err = validateSvg(markup);
    if (err) return setUploadError(err);
    setUploadError(null);
    s.loadSvg(markup, file.name);
  }

  return (
    <div className="text-neutral-100">
      <Section title="Text & Typography">
        <div className="grid grid-cols-2 gap-2">
          <button className={chip(s.source === 'text')} onClick={() => s.patch({ source: 'text' })}>Text</button>
          <button className={chip(s.source === 'svg')} disabled={!s.svgMarkup}
            onClick={() => s.patch({ source: 'svg' })}>SVG logo</button>
        </div>

        <textarea
          rows={2} value={s.text} maxLength={60}
          onChange={(e) => s.patch({ text: e.target.value })}
          placeholder="Your business name"
          className="w-full resize-none rounded border border-neutral-700 bg-neutral-900 p-2 text-sm outline-none focus:border-neutral-400"
        />
        <select
          value={s.fontId} onChange={(e) => s.patch({ fontId: e.target.value as FontId })}
          className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-sm"
        >
          {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>

        <Range label="Font size" value={s.sizeCm} min={5} max={100} step={1} unit=" cm" onChange={(v) => s.patch({ sizeCm: v })} />
        <Range label="Letter spacing" value={s.letterSpacing} min={-0.1} max={0.6} step={0.01} unit=" em" onChange={(v) => s.patch({ letterSpacing: v })} />
        <Range label="Line spacing" value={s.lineSpacing} min={0.8} max={2} step={0.05} unit="×" onChange={(v) => s.patch({ lineSpacing: v })} />
        <Range label="Depth" value={s.depthMm} min={3} max={80} step={1} unit=" mm" onChange={(v) => s.patch({ depthMm: v })} />

        <div className="space-y-2 pt-1">
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={onFile} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full rounded border border-dashed border-neutral-600 py-2 text-sm text-neutral-300 hover:border-neutral-400">
            {s.svgFileName ? `SVG: ${s.svgFileName}` : 'Upload SVG logo'}
          </button>
          {s.svgMarkup && (
            <>
              <Range label="Logo width" value={s.svgWidthCm} min={10} max={200} step={1} unit=" cm" onChange={(v) => s.patch({ svgWidthCm: v })} />
              <button onClick={() => s.clearSvg()} className="text-xs text-neutral-500 underline">Remove logo</button>
            </>
          )}
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>
      </Section>

      <Section title="Material & Finish">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FINISHES) as FinishId[]).map((id) => (
            <button key={id} className={chip(s.finish === id)} onClick={() => s.patch({ finish: id })}>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: FINISHES[id].swatch }} />
              {FINISHES[id].label}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between text-sm text-neutral-300">
          <span>Paint / tint colour {!FINISHES[s.finish].tintable && <em className="text-neutral-600">(n/a)</em>}</span>
          <input type="color" value={s.color} disabled={!FINISHES[s.finish].tintable}
            onChange={(e) => s.patch({ color: e.target.value })} className="h-7 w-10 cursor-pointer disabled:opacity-30" />
        </label>
      </Section>

      <Section title="Illumination">
        <div className="grid grid-cols-4 gap-2">
          {([['off', 'Off'], ['front', 'Front-lit'], ['halo', 'Halo'], ['edge', 'Edge neon']] as [IlluminationMode, string][]).map(
            ([id, label]) => (
              <button key={id} className={chip(s.light.mode === id)} onClick={() => s.patchLight({ mode: id })}>{label}</button>
            ),
          )}
        </div>
        {s.light.mode !== 'off' && (
          <>
            <div className="grid grid-cols-4 gap-2">
              {([3000, 4000, 6000] as const).map((k) => (
                <button key={k} className={chip(s.light.colorMode === 'kelvin' && s.light.kelvin === k)}
                  onClick={() => s.patchLight({ colorMode: 'kelvin', kelvin: k })}>{k}K</button>
              ))}
              <button className={chip(s.light.colorMode === 'rgb')} onClick={() => s.patchLight({ colorMode: 'rgb' })}>RGB</button>
            </div>
            {s.light.colorMode === 'rgb' && (
              <input type="color" value={s.light.rgb} onChange={(e) => s.patchLight({ rgb: e.target.value })}
                className="h-8 w-full cursor-pointer" />
            )}
            <Range label="Brightness" value={s.light.intensity} min={0.5} max={6} step={0.1} onChange={(v) => s.patchLight({ intensity: v })} />
          </>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className={chip(s.environment === 'studio')} onClick={() => s.patch({ environment: 'studio' })}>Studio / day</button>
          <button className={chip(s.environment === 'night')} onClick={() => s.patch({ environment: 'night' })}>Night</button>
        </div>
      </Section>

      <Section title="Preview in your space">
        <ArButton />
      </Section>

      <Section title="Live Price">
        <PricePanel />
      </Section>
    </div>
  );
}
