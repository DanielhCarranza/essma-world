# Test Plan — Essma World

## Test approach

Validate every milestone with automated unit/integration tests where practical, device/browser checks, accessibility review, and supervised child observation that does not collect personal data. A failed safety or save-integrity test blocks release.

## Functional scenarios

| Area | Scenario | Expected result |
| --- | --- | --- |
| Dress-up | Equip one item in each valid slot, then replace and reset it. | Only the selected slot changes; base look restores correctly. |
| Compatibility | Attempt to select a target-incompatible asset. | It is hidden or unavailable; no broken layer renders. |
| Randomize | Use “Sorpresa” with a small unlocked catalog. | Only compatible, unlocked items are selected. |
| Ranch | Return from dress-up to the ranch. | The same saved appearance appears without a full profile reset. |
| Cameos | Tap Loro Loco, Oso Taquito, or Capybara. | A kind teaser appears; no unavailable interaction opens. |
| Mini-game host | A module completes, cancels, or fails. | Only validated approved rewards are written; cancel/failure does not corrupt progress. |

## Save and recovery scenarios

- First launch creates one valid local-primary profile with starter unlocks.
- Reload restores settings and looks for Essma, Juancito, Tori, and Anita.
- Interrupted write or malformed IndexedDB record recovers to the last valid data or a safe base profile with a friendly notice.
- Import rejects malformed, incompatible, or invalid-item backups without replacing the current profile.
- Valid export/import restores the same state after explicit parent confirmation.
- Schema migration preserves known data and assigns safe defaults to newly introduced fields.

## Input, accessibility, and localization scenarios

- Complete the first-session flow by touch, mouse, and keyboard only.
- Verify focus order, focus visibility, enter/space activation, escape/back behavior, and no keyboard trap.
- Verify minimum target size and readable layout at common mobile portrait and desktop widths.
- Verify reduced-motion and mute settings apply before transition/scene audio plays.
- Verify every player-facing string is `es-MX`, short enough for its container, and has an accessible alternative where it is not plain text.
- Verify status, lock state, selection, and errors are understandable without color, sound, or reading long text.

## Safety and content scenarios

- Inspect bundles/network behavior to confirm no ad, payment, chat, analytics, social, location, camera, microphone, or account dependency is introduced.
- Verify parent backup entry cannot be opened accidentally through a single child-facing tap.
- Verify no screen asks for personal data or presents an outbound link to the child.
- Review every culture-specific asset/copy item for documented source, review status, and respectful presentation.
- Verify asset provenance records contain no unlicensed third-party material or marks.

## Playtest observation prompts

With caregiver permission, observe whether a child can: find “Vestir,” choose a friend, make a visible change, understand “Listo,” return to the ranch, and recover from an accidental choice. Record only anonymous usability notes—never names, recordings, or identifiers.

## Release criteria

The Playable Core may ship only when all functional save scenarios pass, no safety blocker is open, the first session works with sound off and reduced motion, and child observation finds no critical navigation confusion.
