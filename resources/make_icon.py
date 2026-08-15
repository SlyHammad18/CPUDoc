import math
import os
import struct
import sys
import zlib

BG = (0, 0, 0, 0)
DISC = (16, 20, 27, 255)
BORDER = (30, 37, 48, 255)
TRACK = (30, 37, 48, 255)
TEAL = (45, 212, 168, 255)
NEEDLE = (230, 234, 240, 255)
HUB = (45, 212, 168, 255)

ARC_START = -135.0
ARC_END = 135.0
ARC_SPAN = 270.0
NEEDLE_FRAC = 0.62


def make_icon(size):
    ss = 3
    big = size * ss
    cx = cy = big / 2.0
    r_out = big * 0.46
    r_in = big * 0.345
    stroke = r_out - r_in
    border_w = big * 0.008
    disc_r = big * 0.472
    needle_len = big * 0.30
    hub_r = big * 0.055
    hub_r2 = hub_r * hub_r

    px = bytearray(size * size * 4)
    for y in range(size):
        for x in range(size):
            acc_a = 0.0
            acc_r = acc_g = acc_b = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    fx = (x * ss + sx + 0.5)
                    fy = (y * ss + sy + 0.5)
                    dx = fx - cx
                    dy = fy - cy
                    d2 = dx * dx + dy * dy
                    d = math.sqrt(d2)
                    col = BG
                    if d <= disc_r:
                        if d > disc_r - border_w:
                            col = BORDER
                        else:
                            col = DISC
                        ang = math.degrees(math.atan2(dy, dx))
                        if r_in <= d <= r_out and ARC_START <= ang <= ARC_END:
                            frac = (ang - ARC_START) / ARC_SPAN
                            if frac <= NEEDLE_FRAC:
                                col = TEAL
                            else:
                                col = TRACK
                        if d2 <= hub_r2:
                            col = HUB
                        else:
                            na = math.radians(ARC_START + NEEDLE_FRAC * ARC_SPAN)
                            nx = cx + needle_len * math.cos(na)
                            ny = cy + needle_len * math.sin(na)
                            ndx = fx - nx
                            ndy = fy - ny
                            nd = math.sqrt(ndx * ndx + ndy * ndy)
                            if nd <= big * 0.011:
                                col = NEEDLE
                    acc_a += col[3] / 255.0
                    acc_r += col[0]
                    acc_g += col[1]
                    acc_b += col[2]
            n = ss * ss
            a = acc_a / n
            if a <= 0:
                continue
            r = int(acc_r / n * a)
            g = int(acc_g / n * a)
            b = int(acc_b / n * a)
            idx = (y * size + x) * 4
            px[idx] = r
            px[idx + 1] = g
            px[idx + 2] = b
            px[idx + 3] = int(a * 255)

    raw = bytearray()
    for y in range(size):
        raw.append(0)
        row = y * size * 4
        raw.extend(px[row : row + size * 4])
    return raw, size


def chunk(typ, data):
    body = typ + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def write_png(path, raw, size):
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    outdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src-tauri", "icons")
    outdir = os.path.normpath(outdir)
    os.makedirs(outdir, exist_ok=True)
    for size, name in [
        (32, "32x32.png"),
        (128, "128x128.png"),
        (256, "128x128@2x.png"),
        (512, "icon.png"),
        (1024, "icon-source.png"),
    ]:
        raw, sz = make_icon(size)
        path = os.path.join(outdir, name)
        write_png(path, raw, sz)
        print("wrote", path)


if __name__ == "__main__":
    sys.exit(main())
