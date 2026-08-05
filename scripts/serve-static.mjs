import http from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
const { default: worker } = await import(workerUrl.href);
const publicDir = join(process.cwd(), "public");
const clientDir = join(process.cwd(), "dist/client");

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".wav": "audio/wav",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const ext = pathname.substring(pathname.lastIndexOf("."));

    // Check dist/client first
    if (pathname !== "/" && ext) {
      const clientPath = join(clientDir, pathname);
      if (existsSync(clientPath)) {
        const data = await readFile(clientPath);
        if (mimeTypes[ext]) res.setHeader("content-type", mimeTypes[ext]);
        res.end(data);
        return;
      }

      // Check public/ next
      const publicPath = join(publicDir, pathname);
      if (existsSync(publicPath)) {
        const data = await readFile(publicPath);
        if (mimeTypes[ext]) res.setHeader("content-type", mimeTypes[ext]);
        res.end(data);
        return;
      }
    }

    // Server-render HTML using vinext worker
    const response = await worker.fetch(
      new Request(url.href, { headers: req.headers }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} }
    );

    res.statusCode = response.status;
    for (const [k, v] of response.headers) {
      res.setHeader(k, v);
    }
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    res.statusCode = 500;
    res.end(String(err?.stack || err));
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Server listening on http://127.0.0.1:3000");
});
