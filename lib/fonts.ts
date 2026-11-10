import type { FontId } from './types';

export const FONT_OPTIONS: { id: FontId; label: string; url: string }[] = [
  { id: 'helvetiker',      label: 'Helvetica',        url: '/fonts/helvetiker_regular.typeface.json' },
  { id: 'helvetiker-bold', label: 'Helvetica Bold',   url: '/fonts/helvetiker_bold.typeface.json' },
  { id: 'optimer',         label: 'Optima',           url: '/fonts/optimer_regular.typeface.json' },
  { id: 'optimer-bold',    label: 'Optima Bold',      url: '/fonts/optimer_bold.typeface.json' },
  { id: 'gentilis',        label: 'Gentilis (serif)', url: '/fonts/gentilis_regular.typeface.json' },
  { id: 'gentilis-bold',   label: 'Gentilis Bold',    url: '/fonts/gentilis_bold.typeface.json' },
];

export const fontUrl = (id: FontId) => FONT_OPTIONS.find((f) => f.id === id)!.url;
