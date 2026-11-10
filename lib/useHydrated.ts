'use client';
import { useEffect, useState } from 'react';

/** Persisted stores differ between server and first client render; gate cart UI on this. */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
