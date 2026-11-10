export interface ArStoreOptions {
  ttlMs: number;
  maxEntries: number;
  maxTotalBytes: number;
  perIpLimit: number;
  perIpWindowMs: number;
  now?: () => number;
}

export type PutResult = { ok: true; id: string } | { ok: false; error: string; status: 429 | 507 };

/**
 * Short-lived in-memory host for AR models. DEMO STORAGE: lost on restart and not shared between serverless
 * instances. Swap `put/get` for S3 / Vercel Blob / R2 with a lifecycle rule (same TTL) when you add the database.
 */
export class ArStore {
  private entries = new Map<string, { data: Uint8Array; createdAt: number }>(); // insertion order = age order
  private hits = new Map<string, number[]>();
  private total = 0;
  private now: () => number;

  constructor(private o: ArStoreOptions) {
    this.now = o.now ?? Date.now;
  }

  put(ip: string, data: Uint8Array): PutResult {
    const t = this.now();
    this.sweep(t);

    const recent = (this.hits.get(ip) ?? []).filter((x) => t - x < this.o.perIpWindowMs);
    if (recent.length >= this.o.perIpLimit) {
      this.hits.set(ip, recent);
      return { ok: false, error: 'Too many AR previews created recently. Please try again later.', status: 429 };
    }
    if (data.length > this.o.maxTotalBytes) return { ok: false, error: 'Model too large.', status: 507 };

    // make room: evict oldest first
    while (this.entries.size >= this.o.maxEntries || this.total + data.length > this.o.maxTotalBytes) {
      const oldest = this.entries.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.drop(oldest);
    }

    const id = globalThis.crypto.randomUUID();
    this.entries.set(id, { data, createdAt: t });
    this.total += data.length;
    recent.push(t);
    this.hits.set(ip, recent);
    return { ok: true, id };
  }

  get(id: string): Uint8Array | null {
    const e = this.entries.get(id);
    if (!e) return null;
    if (this.now() - e.createdAt >= this.o.ttlMs) {
      this.drop(id);
      return null;
    }
    return e.data;
  }

  stats() {
    return { entries: this.entries.size, bytes: this.total };
  }

  private drop(id: string) {
    const e = this.entries.get(id);
    if (e) this.total -= e.data.length;
    this.entries.delete(id);
  }

  private sweep(t: number) {
    for (const [id, e] of this.entries) {
      if (t - e.createdAt < this.o.ttlMs) break; // oldest first → stop at first live one
      this.drop(id);
    }
    for (const [ip, list] of this.hits) {
      const live = list.filter((x) => t - x < this.o.perIpWindowMs);
      if (live.length) this.hits.set(ip, live); else this.hits.delete(ip);
    }
  }
}

const g = globalThis as unknown as { __cre8Ar?: ArStore };
/** Process-wide singleton (survives dev HMR). */
export const arStore = (g.__cre8Ar ??= new ArStore({
  ttlMs: 24 * 60 * 60 * 1000,
  maxEntries: 200,
  maxTotalBytes: 150 * 1024 * 1024,
  perIpLimit: 10,
  perIpWindowMs: 60 * 60 * 1000,
}));
