# Asset QA — playable core

All v1 raster assets are original production assets. Repository reference
images informed only broad character identity and warm Sonoran direction; they
are not shipped, fetched at runtime, or copied. No external cultural review
was performed or claimed.

## Visual QA gate

The release-candidate visual gate is 85/100. A Terra visual review checked
character consistency, cutout silhouette, layer placement, chroma-key edge
readiness, and absence of text, logos, copied poses, or branded elements.

| Asset group                              | Result    | Product approval                                                                                                                                                  |
| ---------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Juancito base                            | 89/100    | Pending final product approval                                                                                                                                    |
| Tori base                                | 92/100    | Pending final product approval                                                                                                                                    |
| Anita base                               | 91/100    | Pending final product approval                                                                                                                                    |
| Essma base                               | 88/100    | Approved release candidate: dark curls, blue bow, light complexion, young child identity with non-obtrusive neutral base |
| Original world map, landscape + portrait | 89–92/100 | Pending final product approval                                                                                                                                    |
| ~65 wearable layers (v1 + v2 expanded closet) | 87–94/100 (v1 baseline); v2 expanded closet pending full game-scale visual QA | Pending final product approval; v2 expanded closet still needs in-game anchor/alpha pass at ranch and dress-up scale |
| Ten patio decoration layers              | 88–92/100 | Pending final product approval                                                                                                                                    |
| Three cameo portraits                    | 88/100    | Pending final product approval                                                                                                                                    |

The v1 wearable pass included crop-and-place correction so every item shares
its target character’s 1254px layer canvas. The v2 expanded closet (~65 items,
5+ per slot across Essma, Juancito, Tori, and Anita) still needs a full
game-scale visual QA pass at ranch and dress-up scale; `productApproved` remains
false and `culturalReview` remains `"not-performed"`. Runtime and thumbnail
files were checked for dimensions and alpha transparency where present. The
decor pack uses 768px transparent runtime canvases and 256px thumbnails; the
map has separately authored landscape and portrait files.

## Provenance and processing

- Runtime bases, layers, cameos, map, and decor: `public/assets/**/v*/`
- Derived thumbnails: `public/assets/**/v*/thumbnails/`
- Generated pack manifests: `public/assets/wearables/v2/wearables-v2.metadata.json`, `public/assets/decor/v1/decor-v1.metadata.json`, and `public/assets/world/v2/sonora-world-map-v2.metadata.json`
- Chroma key removal: local image-generation helper with border key, soft matte,
  and despill
- Layer placement: `scripts/reposition-wearable.py`
- Audio: locally synthesized original WAV files in `public/assets/audio/v1/`

Catalog QA metadata intentionally keeps `productApproved: false` and
`culturalReview: "not-performed"` until a final product reviewer signs off.
