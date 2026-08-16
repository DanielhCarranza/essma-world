import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Essma World", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html, /<title>Essma World \| Rancho de Essma<\/title>/i);
  assert.match(html, /Essma World/i);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("replaces the disposable starter preview", async () => {
  const [
    page,
    worldMap,
    ranchScene,
    ranchDecorator,
    profileStore,
    layout,
    packageJson,
    destinationRegistry,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/world-map.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ranch-scene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ranch-decorator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/profile-store.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/destinations.ts", import.meta.url), "utf8"),
  ]);

  assert.match(profileStore, /indexedDB/);
  assert.match(page, /WorldMap/);
  assert.match(worldMap, /Rancho/);
  assert.match(worldMap, /Desierto/);
  assert.match(worldMap, /Pueblo/);
  assert.match(worldMap, /Bosque/);
  assert.match(worldMap, /Toca un lugar/);
  assert.match(worldMap, /onEnterDestination/);
  assert.match(destinationRegistry, /Essma Bros/);
  assert.match(destinationRegistry, /Essma Kart/);
  assert.match(worldMap, /Próximamente|Pronto/);
  assert.match(page, /Mantén presionado 2 segundos/);
  assert.match(page, /Decorar/);
  assert.match(page, /MiniGame|Colección|Opciones para adultos/);
  assert.match(page, /DestinationShell/);
  assert.match(page, /DESTINATION_REWARD_IDS/);
  assert.doesNotMatch(page, /from ["']three["']/);
  assert.match(destinationRegistry, /DESTINATION_REWARD_IDS/);
  assert.match(ranchDecorator, /place-decor/);
  assert.match(ranchDecorator, /undo-decor/);
  assert.match(layout, /Essma World/);
  assert.match(ranchScene, /rancho-de-essma-v1\.png/);
  assert.doesNotMatch(ranchScene, /from ["']three["']/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /@google\/genai/);

  await assert.rejects(
    access(new URL("../app\/_sites-preview", import.meta.url)),
  );
});
