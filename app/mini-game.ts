/**
 * Framework-neutral boundary for optional mini-games.
 *
 * A mini-game receives a read-only snapshot and returns an outcome. It never
 * receives the profile repository, IndexedDB, or a profile setter. The React
 * host remains the only place that may save an accepted result.
 */

export type MiniGameSettings = Readonly<{
  music: boolean;
  sfx: boolean;
  reducedMotion: boolean;
}>;

export type MiniGamePlayer = Readonly<{
  profileId: string;
  unlockedIds: readonly string[];
}>;

export type MiniGameContext = Readonly<{
  player: MiniGamePlayer;
  settings: MiniGameSettings;
  locale: "es-MX";
}>;

/** Only catalog IDs can be awarded; arbitrary profile fields are not writable. */
export type MiniGameReward = Readonly<{
  type: "unlock";
  catalogId: string;
}>;

export type MiniGameResult =
  | Readonly<{ status: "completed"; rewards: readonly MiniGameReward[] }>
  | Readonly<{ status: "cancelled" }>
  | Readonly<{ status: "failed"; reason: "unsupported" | "load-error" | "runtime-error" }>;

/** The lazy module shape a future Three.js (or other) mini-game must expose. */
export type MiniGameModule = Readonly<{
  launch(context: MiniGameContext): Promise<MiniGameResult>;
}>;

export type MiniGameRewardPolicy = Readonly<{
  allowedUnlockIds: ReadonlySet<string>;
}>;

export type MiniGamePersistence = Readonly<{
  /** Save the complete next snapshot in one transaction. */
  save(nextPlayer: MiniGamePlayer): Promise<void>;
}>;

export type MiniGameApplyResult =
  | Readonly<{ status: "saved"; player: MiniGamePlayer; awardedIds: readonly string[] }>
  | Readonly<{ status: "ignored"; reason: "cancelled" | "failed"; player: MiniGamePlayer }>
  | Readonly<{ status: "rejected"; reason: "invalid-reward"; player: MiniGamePlayer }>;

function snapshotWithUnlocks(player: MiniGamePlayer, unlockedIds: readonly string[]): MiniGamePlayer {
  return Object.freeze({
    profileId: player.profileId,
    unlockedIds: Object.freeze([...unlockedIds]),
  });
}

/**
 * Validates every reward before saving. This prevents a partly-applied result
 * and means mini-game code cannot directly mutate the supplied player snapshot.
 */
export async function applyMiniGameResult(
  player: MiniGamePlayer,
  result: MiniGameResult,
  policy: MiniGameRewardPolicy,
  persistence: MiniGamePersistence,
): Promise<MiniGameApplyResult> {
  if (result.status === "cancelled") return { status: "ignored", reason: "cancelled", player };
  if (result.status === "failed") return { status: "ignored", reason: "failed", player };

  const awardedIds = result.rewards.map((reward) => reward.catalogId);
  if (
    result.rewards.some((reward) => reward.type !== "unlock" || !policy.allowedUnlockIds.has(reward.catalogId))
    || new Set(awardedIds).size !== awardedIds.length
  ) {
    return { status: "rejected", reason: "invalid-reward", player };
  }

  const knownUnlocks = new Set(player.unlockedIds);
  const newIds = awardedIds.filter((id) => !knownUnlocks.has(id));
  if (newIds.length === 0) return { status: "saved", player, awardedIds: [] };

  const nextPlayer = snapshotWithUnlocks(player, [...player.unlockedIds, ...newIds]);
  await persistence.save(nextPlayer);
  return { status: "saved", player: nextPlayer, awardedIds: newIds };
}
