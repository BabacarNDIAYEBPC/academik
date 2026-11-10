"""Create an opaque iOS icon without modifying the original brand image."""
from pathlib import Path
import struct
import zlib

root = Path(__file__).resolve().parents[1]
data = (root / "assets/images/icon.png").read_bytes()
position, compressed, color_chunks = 8, [], []
while position < len(data):
    size = struct.unpack(">I", data[position:position + 4])[0]
    kind = data[position + 4:position + 8]
    value = data[position + 8:position + 8 + size]
    position += size + 12
    if kind == b"IHDR":
        width, height, depth, color, _, _, interlace = struct.unpack(">IIBBBBB", value)
    elif kind == b"IDAT":
        compressed.append(value)
    elif kind in (b"sRGB", b"gAMA", b"cHRM", b"iCCP"):
        color_chunks.append((kind, value))
assert (width, height, depth, color, interlace) == (1024, 1024, 8, 6, 0)
raw = zlib.decompress(b"".join(compressed))
stride = width * 4
previous, opaque = bytearray(stride), bytearray()
for y in range(height):
    start = y * (stride + 1)
    mode = raw[start]
    assert mode in range(5)
    row = bytearray(raw[start + 1:start + 1 + stride])
    for i in range(stride):
        left = row[i - 4] if i >= 4 else 0
        up = previous[i]
        corner = previous[i - 4] if i >= 4 else 0
        prediction = 0
        if mode == 1:
            prediction = left
        elif mode == 2:
            prediction = up
        elif mode == 3:
            prediction = (left + up) // 2
        elif mode == 4:
            p = left + up - corner
            distances = [abs(p - left), abs(p - up), abs(p - corner)]
            prediction = [left, up, corner][distances.index(min(distances))]
        row[i] = (row[i] + prediction) & 255
    opaque.append(0)  # PNG filter None
    for i in range(0, stride, 4):
        alpha = row[i + 3]
        opaque.extend((row[i + c] * alpha + 255 * (255 - alpha) + 127) // 255 for c in range(3))
    previous = row

def chunk(kind, value):
    return struct.pack(">I", len(value)) + kind + value + struct.pack(">I", zlib.crc32(kind + value) & 0xFFFFFFFF)

output = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
output += b"".join(chunk(kind, value) for kind, value in color_chunks)
output += chunk(b"IDAT", zlib.compress(bytes(opaque), 9)) + chunk(b"IEND", b"")
(root / "assets/images/icon-ios.png").write_bytes(output)
print("Opaque 1024x1024 RGB iOS icon prepared; original image unchanged.")
