from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\HP\AppData\Local\Temp\codex-clipboard-35c3fa7d-eee0-4551-82de-bfd361ec4c07.png")
OUT = ROOT / "video" / "snowy_japanese_alley_ghost_night.webp"

WIDTH = 960
HEIGHT = 540
FPS = 12
SECONDS = 6
FRAMES = FPS * SECONDS


def ease(t: float) -> float:
    return t * t * (3 - 2 * t)


def flicker(frame: int, phase: float, strength: float = 1.0) -> float:
    base = 0.55 + 0.08 * math.sin(frame * 0.41 + phase)
    pulse = 0.0
    for center, width, amp in ((38, 2.1, -0.35), (71, 1.4, 0.22), (92, 2.8, -0.22), (114, 1.7, -0.42)):
        pulse += amp * math.exp(-((frame - center) / width) ** 2)
    return max(0.1, base + pulse * strength)


def make_snow(rng: random.Random, count: int, size_range: tuple[float, float], speed: tuple[float, float], drift: tuple[float, float]):
    flakes = []
    for _ in range(count):
        flakes.append(
            {
                "x": rng.uniform(-80, WIDTH + 80),
                "y": rng.uniform(-HEIGHT, HEIGHT),
                "r": rng.uniform(*size_range),
                "vy": rng.uniform(*speed),
                "vx": rng.uniform(*drift),
                "alpha": rng.randint(55, 180),
                "phase": rng.uniform(0, math.tau),
            }
        )
    return flakes


def draw_ghost(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float, opacity: int) -> None:
    if opacity <= 0:
        return
    fill = (220, 230, 240, opacity)
    haze = (220, 230, 240, max(0, opacity // 3))
    w = int(24 * scale)
    h = int(72 * scale)
    draw.ellipse((cx - w, cy - h, cx + w, cy - h + int(35 * scale)), fill=haze)
    draw.rounded_rectangle((cx - w, cy - h + int(18 * scale), cx + w, cy + h // 2), radius=max(4, w // 2), fill=fill)
    for i in range(5):
        yy = cy + h // 2 + i * int(5 * scale)
        draw.line((cx - w + i * 2, yy, cx + w - i * 3, yy + int(6 * scale)), fill=haze, width=max(1, int(2 * scale)))


def add_light(layer: Image.Image, x: int, y: int, radius: int, intensity: float) -> None:
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    for i in range(7, 0, -1):
        r = int(radius * i / 7)
        alpha = int(18 * intensity * (i / 7) ** 1.5)
        gd.ellipse((x - r, y - r, x + r, y + r), fill=(205, 225, 255, alpha))
    gd.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(245, 250, 255, int(190 * intensity)))
    layer.alpha_composite(glow)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")
    src_w, src_h = source.size
    crop_h = int(src_w * 9 / 16)
    crop_y = max(0, min(src_h - crop_h, 134))
    base = source.crop((0, crop_y, src_w, crop_y + crop_h)).resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    base = ImageEnhance.Color(base).enhance(0.78)
    base = ImageEnhance.Contrast(base).enhance(1.12)

    rng = random.Random(20260710)
    far = make_snow(rng, 260, (0.7, 1.3), (1.4, 2.5), (-0.8, 0.8))
    mid = make_snow(rng, 170, (1.1, 2.3), (2.8, 4.8), (-1.4, 0.9))
    near = make_snow(rng, 58, (2.0, 4.4), (5.2, 8.8), (-2.2, 0.4))
    ghosts = [(575, 248, 0.38, 18, 42), (615, 238, 0.35, 20, 41), (746, 304, 0.46, 48, 68)]

    frames: list[Image.Image] = []
    for f in range(FRAMES):
        t = f / (FRAMES - 1)
        zoom = 1.0 + 0.028 * ease(t)
        zw, zh = int(WIDTH / zoom), int(HEIGHT / zoom)
        crop_x = int((WIDTH - zw) * (0.44 + 0.04 * t))
        crop_y = int((HEIGHT - zh) * (0.48 + 0.04 * t))
        frame = base.crop((crop_x, crop_y, crop_x + zw, crop_y + zh)).resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC).convert("RGBA")

        blue = Image.new("RGBA", (WIDTH, HEIGHT), (8, 20, 58, 48))
        frame = Image.alpha_composite(frame, blue)

        light_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        main_light = flicker(f, 0.8, 1.0)
        add_light(light_layer, 630, 116, 54, main_light)
        add_light(light_layer, 620, 236, 34, 0.55 + 0.08 * math.sin(f * 0.13))
        add_light(light_layer, 450, 280, 22, 0.34)
        frame.alpha_composite(light_layer)

        ghost_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        gd = ImageDraw.Draw(ghost_layer, "RGBA")
        for gx, gy, gs, start, end in ghosts:
            if start <= f <= end:
                local = (f - start) / max(1, end - start)
                op = int(62 * math.sin(math.pi * local) ** 1.4)
                wobble = int(3 * math.sin(f * 0.12 + gx))
                draw_ghost(gd, gx + wobble, gy, gs, op)
        ghost_layer = ghost_layer.filter(ImageFilter.GaussianBlur(1.5))
        frame.alpha_composite(ghost_layer)

        snow_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        sd = ImageDraw.Draw(snow_layer, "RGBA")
        for flake_set, blur in ((far, False), (mid, False), (near, True)):
            for flake in flake_set:
                x = (flake["x"] + flake["vx"] * f + 7 * math.sin(f * 0.035 + flake["phase"])) % (WIDTH + 160) - 80
                y = (flake["y"] + flake["vy"] * f) % (HEIGHT + 180) - 90
                r = flake["r"]
                a = flake["alpha"]
                if blur:
                    sd.line((x, y, x + flake["vx"] * 1.6, y + flake["vy"] * 1.8), fill=(225, 235, 255, a), width=max(1, int(r)))
                else:
                    sd.ellipse((x - r, y - r, x + r, y + r), fill=(225, 235, 255, a))

        if f % 43 in (0, 1, 2, 3, 4, 5):
            sweep_x = 80 + f * 11 % WIDTH
            sd.line((sweep_x, 40, sweep_x - 42, 150), fill=(235, 242, 255, 120), width=4)

        if main_light < 0.38:
            snow_layer = ImageEnhance.Brightness(snow_layer).enhance(0.78)
        frame.alpha_composite(snow_layer)

        vignette = Image.new("L", (WIDTH, HEIGHT), 0)
        vd = ImageDraw.Draw(vignette)
        vd.ellipse((-190, -120, WIDTH + 190, HEIGHT + 170), fill=180)
        vignette = vignette.filter(ImageFilter.GaussianBlur(90))
        dark = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 20, 95))
        frame = Image.composite(frame, Image.alpha_composite(frame, dark), vignette)
        frames.append(frame.convert("RGB"))

    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=int(1000 / FPS),
        loop=0,
        quality=82,
        method=4,
    )
    print(OUT)


if __name__ == "__main__":
    main()
