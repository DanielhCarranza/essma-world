import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMiniGameResult,
  type MiniGamePersistence,
  type MiniGamePlayer,
  type MiniGameRewardPolicy,
} from "../app/mini-game.ts";

const player: MiniGamePlayer = Object.freeze({
  profileId: "local-primary",
  unlockedIds: Object.freeze(["wearable.essma.vestido-girasol"]),
});
const policy: MiniGameRewardPolicy = {
  allowedUnlockIds: new Set(["wearable.essma.vestido-girasol", "wearable.tori.gorrito-hojita"]),
};

function persistence() {
  const saves: MiniGamePlayer[] = [];
  const adapter: MiniGamePersistence = { save: async (next) => { saves.push(next); } };
  return { adapter, saves };
}

test("only allowed catalog unlock rewards are persisted atomically", async () => {
  const { adapter, saves } = persistence();
  const outcome = await applyMiniGameResult(player, {
    status: "completed",
    rewards: [{ type: "unlock", catalogId: "wearable.tori.gorrito-hojita" }],
  }, policy, adapter);

  assert.equal(outcome.status, "saved");
  assert.deepEqual(outcome.awardedIds, ["wearable.tori.gorrito-hojita"]);
  assert.equal(saves.length, 1);
  assert.deepEqual(saves[0]?.unlockedIds, ["wearable.essma.vestido-girasol", "wearable.tori.gorrito-hojita"]);
  assert.deepEqual(player.unlockedIds, ["wearable.essma.vestido-girasol"]);
  assert.notEqual(saves[0], player);
});

test("invalid rewards are rejected before any profile save", async () => {
  const { adapter, saves } = persistence();
  const outcome = await applyMiniGameResult(player, {
    status: "completed",
    rewards: [
      { type: "unlock", catalogId: "wearable.tori.gorrito-hojita" },
      { type: "unlock", catalogId: "not-in-the-catalog" },
    ],
  }, policy, adapter);

  assert.deepEqual(outcome, { status: "rejected", reason: "invalid-reward", player });
  assert.equal(saves.length, 0);
  assert.deepEqual(player.unlockedIds, ["wearable.essma.vestido-girasol"]);
});

test("duplicate rewards are rejected before any profile save", async () => {
  const { adapter, saves } = persistence();
  const reward = { type: "unlock" as const, catalogId: "wearable.tori.gorrito-hojita" };
  const outcome = await applyMiniGameResult(player, { status: "completed", rewards: [reward, reward] }, policy, adapter);

  assert.deepEqual(outcome, { status: "rejected", reason: "invalid-reward", player });
  assert.equal(saves.length, 0);
});

test("cancelled and failed mini-games never save or mutate the profile", async () => {
  const { adapter, saves } = persistence();
  const cancelled = await applyMiniGameResult(player, { status: "cancelled" }, policy, adapter);
  const failed = await applyMiniGameResult(player, { status: "failed", reason: "runtime-error" }, policy, adapter);

  assert.deepEqual(cancelled, { status: "ignored", reason: "cancelled", player });
  assert.deepEqual(failed, { status: "ignored", reason: "failed", player });
  assert.equal(saves.length, 0);
  assert.deepEqual(player.unlockedIds, ["wearable.essma.vestido-girasol"]);
});

test("garden activity reward policy unlocks allowlisted catalog items", async () => {
  const { GARDEN_REWARD_IDS } = await import("../app/garden-activity.tsx");
  const gardenPolicy: MiniGameRewardPolicy = {
    allowedUnlockIds: new Set(GARDEN_REWARD_IDS),
  };
  const { adapter, saves } = persistence();
  const outcome = await applyMiniGameResult(
    player,
    {
      status: "completed",
      rewards: [{ type: "unlock", catalogId: "decor.rancho.maceta-girasol" }],
    },
    gardenPolicy,
    adapter,
  );

  assert.equal(outcome.status, "saved");
  assert.deepEqual(outcome.awardedIds, ["decor.rancho.maceta-girasol"]);
  assert.equal(saves.length, 1);
});
