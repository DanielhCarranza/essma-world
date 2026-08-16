#!/usr/bin/env python3
"""Downscale embedded GLB textures for a web-safe Essma Kart runtime file."""

from __future__ import annotations

import json
import struct
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image

JSON_CHUNK = b"JSON"
BIN_CHUNK = b"BIN\x00"
MAX_TEXTURE = 1024


def read_glb(path: Path) -> tuple[dict, bytes]:
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2:
        raise SystemExit(f"Unsupported GLB: {magic!r} v{version}")
    offset = 12
    json_len, json_type = struct.unpack_from("<I4s", data, offset)
    offset += 8
    gltf = json.loads(data[offset : offset + json_len].rstrip(b"\x00"))
    offset += json_len
    if offset % 4:
        offset += 4 - (offset % 4)
    bin_len, bin_type = struct.unpack_from("<I4s", data, offset)
    offset += 8
    blob = data[offset : offset + bin_len]
    if json_type != JSON_CHUNK or bin_type != BIN_CHUNK:
        raise SystemExit("Unexpected GLB chunk types")
    if length:
        pass
    return gltf, blob


def pad4(raw: bytes, pad_byte: bytes = b"\x00") -> bytes:
    pad = (4 - (len(raw) % 4)) % 4
    return raw + (pad_byte * pad)


def write_glb(path: Path, gltf: dict, blob: bytes) -> None:
    gltf["buffers"] = [{"byteLength": len(blob)}]
    # glTF JSON chunks must be padded with spaces, not nulls.
    json_bytes = pad4(json.dumps(gltf, separators=(",", ":")).encode("utf-8"), b" ")
    bin_bytes = pad4(blob)
    total = 12 + 8 + len(json_bytes) + 8 + len(bin_bytes)
    header = struct.pack("<4sII", b"glTF", 2, total)
    json_chunk = struct.pack("<I4s", len(json_bytes), JSON_CHUNK) + json_bytes
    bin_chunk = struct.pack("<I4s", len(bin_bytes), BIN_CHUNK) + bin_bytes
    path.write_bytes(header + json_chunk + bin_chunk)


def compress_image(raw: bytes, name: str) -> tuple[bytes, str]:
    image = Image.open(BytesIO(raw)).convert("RGB")
    if max(image.size) > MAX_TEXTURE:
        image.thumbnail((MAX_TEXTURE, MAX_TEXTURE), Image.Resampling.LANCZOS)
    out = BytesIO()
    # Keep normals a bit cleaner; color/ORM can be smaller JPEGs.
    if "normal" in name.lower():
        image.save(out, format="JPEG", quality=82, optimize=True)
    else:
        image.save(out, format="JPEG", quality=72, optimize=True)
    return out.getvalue(), "image/jpeg"


def main() -> None:
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    dest.parent.mkdir(parents=True, exist_ok=True)
    gltf, blob = read_glb(src)
    views = gltf["bufferViews"]
    new_blob = bytearray()
    image_views = {img["bufferView"] for img in gltf.get("images", [])}

    for index, view in enumerate(views):
        start = view.get("byteOffset", 0)
        raw = blob[start : start + view["byteLength"]]
        if index in image_views:
            image = next(img for img in gltf["images"] if img["bufferView"] == index)
            raw, mime = compress_image(raw, image.get("name") or "")
            image["mimeType"] = mime
        view["byteOffset"] = len(new_blob)
        view["byteLength"] = len(raw)
        new_blob.extend(raw)
        pad = (4 - (len(new_blob) % 4)) % 4
        new_blob.extend(b"\x00" * pad)

    write_glb(dest, gltf, bytes(new_blob))
    print(f"{src.stat().st_size / 1e6:.1f}MB -> {dest.stat().st_size / 1e6:.1f}MB ({dest})")


if __name__ == "__main__":
    main()
