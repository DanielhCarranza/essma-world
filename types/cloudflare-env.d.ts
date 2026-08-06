/**
 * Minimal ambient types so `tsc --noEmit` can typecheck the vinext worker
 * entry without requiring `@cloudflare/workers-types` as a direct dependency.
 */

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    [key: string]: unknown;
  };
}

interface D1Database {
  prepare(query: string): unknown;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: unknown[]): Promise<T[]>;
  exec(query: string): Promise<unknown>;
}

interface Fetcher {
  fetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response>;
}
