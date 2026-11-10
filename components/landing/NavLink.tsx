'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Link that marks the current page for screen readers (aria-current) and highlights it. */
export function NavLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  const path = usePathname();
  const active = path === href || path.startsWith(href + '/');
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={`${className} ${active ? 'text-white' : ''}`}>
      {children}
    </Link>
  );
}
