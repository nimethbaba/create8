/**
 * Photos of REAL finished signs. Empty on purpose — we don't ship made-up "customer work".
 * To add some: put the image in /public/gallery and add an entry, e.g.
 *   { src: '/gallery/bakery.jpg', alt: 'Painted wood sign reading BAKERY above a shop door', title: 'Corner bakery', caption: 'Painted wood, halo-lit' }
 * The Gallery page shows a "Finished signs" section automatically once this list has entries.
 */
export interface Project { src: string; alt: string; title: string; caption?: string }
export const PROJECTS: Project[] = [];
