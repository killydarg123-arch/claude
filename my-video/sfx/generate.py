"""Synthesises the launch ad's sound effects into public/sfx/.

Every sound is generated from scratch (noise, sines, filters, a synthetic
reverb), so the brand owns them outright. Run: python3 sfx/generate.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def times(dur):
    return np.arange(int(dur * SR)) / SR


def env(dur, attack, decay):
    """Linear attack, then exponential decay with time constant `decay`."""
    t = times(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = np.exp(-np.maximum(t - attack, 0) / decay)
    return a * d


def bell(dur, peak):
    """Smooth swell that peaks at `peak` (0..1) of the duration."""
    t = times(dur) / dur
    up = np.sin(np.clip(t / peak, 0, 1) * np.pi / 2) ** 2
    down = np.cos(np.clip((t - peak) / (1 - peak), 0, 1) * np.pi / 2) ** 2
    return np.where(t < peak, up, down)


def filt(x, kind, freq, order=2):
    return sosfilt(butter(order, freq, kind, fs=SR, output="sos"), x)


def svf(x, fc, q, mode="bp"):
    """Zavalishin TPT state variable filter with a per-sample cutoff."""
    fc = np.broadcast_to(np.clip(fc, 20, SR * 0.45), x.shape)
    g = np.tan(np.pi * fc / SR)
    k = 1 / q
    a1 = 1 / (1 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    out = np.empty_like(x)
    ic1 = ic2 = 0.0
    for i in range(len(x)):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[i] = v1 if mode == "bp" else v2 if mode == "lp" else x[i] - k * v1 - v2
    return out


def sweep(dur, f0, f1, curve=1.0):
    """Exponential frequency glide from f0 to f1, shaped by `curve`."""
    t = (times(dur) / dur) ** curve
    return f0 * (f1 / f0) ** t


def tone(freqs, phase=0.0):
    """Sine following a per-sample frequency array."""
    return np.sin(2 * np.pi * np.cumsum(freqs) / SR + phase)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def pad(x, dur):
    n = int(dur * SR)
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def stereo(left, right=None):
    return np.stack([left, left if right is None else right], axis=1)


def pan(mono, position):
    """Equal power pan; position is -1 (left) to 1 (right), scalar or array."""
    angle = (np.asarray(position) + 1) * np.pi / 4
    return stereo(mono * np.cos(angle), mono * np.sin(angle))


def make_ir(dur, decay):
    t = times(dur)
    channels = []
    for _ in range(2):
        n = rng.standard_normal(len(t))
        low = filt(n, "lowpass", 2500)
        high = n - low
        ir = low * np.exp(-t / decay) + 0.5 * high * np.exp(-t / (decay * 0.4))
        ir = np.concatenate([np.zeros(int(0.012 * SR)), ir])
        channels.append(ir / np.sqrt(np.sum(ir**2)))
    return channels


ROOM = make_ir(0.6, 0.12)
HALL = make_ir(2.4, 0.7)


def reverb(x, wet, ir=ROOM):
    if x.ndim == 1:
        x = stereo(x)
    # Fade the dry tail so long sounds never end on a click.
    fade = min(int(0.06 * SR), len(x))
    x = x.copy()
    x[-fade:] *= np.cos(np.linspace(0, np.pi / 2, fade))[:, None] ** 2
    tail = len(ir[0])
    dry = np.pad(x, ((0, tail - 1), (0, 0)))
    wet_sig = np.stack(
        [fftconvolve(x[:, c], ir[c]) for c in range(2)], axis=1
    )
    return dry + wet * wet_sig


def save(name, x):
    if x.ndim == 1:
        x = stereo(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    fade = min(int(0.012 * SR), len(x))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    wavfile.write(OUT / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"{name}.wav  {len(x) / SR:.2f}s")


def click(dur=0.003, lo=2000, hi=9000):
    return filt(noise(dur), "bandpass", [lo, hi]) * np.hanning(int(dur * SR))


# Word reveal: a tiny glassy tick.
def word_tick():
    d = 0.09
    body = np.sin(2 * np.pi * 2400 * times(d)) * env(d, 0.0005, 0.010)
    air = 0.4 * np.sin(2 * np.pi * 3700 * times(d)) * env(d, 0.0005, 0.006)
    return reverb(pad(click(0.002, 3000, 12000), d) * 0.6 + body + air, 0.08)


# Serif emphasis word: a rounder wooden tock with a little room.
def serif_tock():
    d = 0.25
    f = 760 * (1 + 0.25 * np.exp(-times(d) / 0.008))
    body = tone(f) * env(d, 0.0008, 0.035)
    low = 0.5 * np.sin(2 * np.pi * 190 * times(d)) * env(d, 0.001, 0.05)
    return reverb(pad(click(0.002, 1500, 8000), d) * 0.5 + body + low, 0.18)


# Finger tap on glass.
def tap():
    d = 0.14
    body = np.sin(2 * np.pi * 1650 * times(d)) * env(d, 0.0004, 0.014)
    thump = 0.6 * np.sin(2 * np.pi * 135 * times(d)) * env(d, 0.001, 0.022)
    return reverb(pad(click(0.0025, 1500, 7000), d) + 0.7 * body + thump, 0.1)


# Bubble pop with a falling pitch.
def pop(f0, depth=0.9, decay=0.045):
    d = 0.4
    f = f0 * (1 + depth * np.exp(-times(d) / 0.012))
    x = tone(f) * env(d, 0.001, decay)
    x += 0.15 * tone(2 * f) * env(d, 0.001, decay * 0.6)
    x += pad(click(0.0015, 2000, 9000), d) * 0.25
    return reverb(x, 0.14)


# Island opening: a short airy bloom.
def bloom():
    d = 0.6
    n = svf(noise(d), sweep(d, 900, 3400, 0.7), 0.9)
    sheen = 0.08 * (
        np.sin(2 * np.pi * 2637 * times(d)) + np.sin(2 * np.pi * 3951 * times(d))
    )
    x = (n * 0.35 + sheen) * bell(d, 0.25)
    return reverb(x, 0.2)


def type_tick(freq):
    d = 0.05
    x = pad(click(0.0015, 2500, 10000), d) * 0.5
    x += 0.5 * np.sin(2 * np.pi * freq * times(d)) * env(d, 0.0003, 0.005)
    return x


# Island stretching into the phone: a wide whoosh with a sub swell.
def morph():
    d = 0.95
    shape = bell(d, 0.62)
    fc = sweep(d, 350, 2600, 0.9)
    left = svf(noise(d), fc, 1.2)
    right = svf(noise(d), fc * 1.07, 1.2)
    air = filt(noise(d), "bandpass", [5000, 9000]) * 0.04
    sub = 0.5 * tone(sweep(d, 46, 64)) * bell(d, 0.7)
    left = filt((left + air) * shape, "lowpass", 8500)
    right = filt((right + air) * shape, "lowpass", 8500)
    return reverb(stereo(left + sub, right + sub), 0.15)


# Screen push: a quick swipe travelling right to left.
def swipe():
    d = 0.42
    fc = sweep(d, 2800, 800, 0.8)
    n = svf(noise(d), fc, 1.6) * env(d, 0.025, 0.11)
    n = filt(n, "lowpass", 7000)
    return reverb(pan(n, np.linspace(0.6, -0.6, len(n))), 0.1)


# Button growing into a pill: a small rising swish.
def expand():
    d = 0.32
    n = svf(noise(d), sweep(d, 700, 2400), 1.6) * bell(d, 0.55)
    return reverb(filt(n, "lowpass", 7000), 0.12)


# "Saved": two glass bell notes a fourth apart.
def chime():
    d = 2.0

    def glass(freq, start):
        t = times(d - start)
        partials = [(1, 1.0, 0.9), (2.76, 0.1, 0.25), (5.4, 0.025, 0.1)]
        x = sum(
            a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / dec)
            for r, a, dec in partials
        )
        x *= np.clip(t / 0.006, 0, 1)
        return pad(np.concatenate([np.zeros(int(start * SR)), x]), d)

    x = glass(1174.66, 0) + glass(1567.98, 0.09) + 0.5 * glass(587.33, 0.09)
    return reverb(filt(x, "lowpass", 5500), 0.4, HALL)


# Camera diving into the screen: accelerating whoosh that cuts on landing.
def dive():
    d = 1.27
    t = times(d) / d
    fc = sweep(d, 220, 5200, 2.2)
    left = filt(svf(noise(d), fc, 0.9), "lowpass", 9000)
    right = filt(svf(noise(d), fc * 1.05, 0.9), "lowpass", 9000)
    rise = 0.25 * tone(sweep(d, 110, 420, 2.0))
    amp = t**1.6 * np.clip((1 - t) / 0.03, 0, 1)
    return stereo((left + rise) * amp, (right + rise) * amp)


# Landing hit: sub drop with enough harmonics to read on phone speakers.
def hit(level_noise=0.35):
    d = 2.4
    t = times(d)
    f = 38 + 34 * np.exp(-t / 0.22)
    sub = tone(f) * env(d, 0.002, 0.65)
    sub = np.tanh(1.8 * sub) + 0.25 * tone(2 * f) * env(d, 0.002, 0.4)
    thump = filt(noise(d), "lowpass", 260) * env(d, 0.001, 0.05) * level_noise
    return reverb(sub + thump, 0.12, HALL)


# Landing on black: a heavy impact. A deep pitch drop for weight, a punchy
# knock and saturation so it still lands on phone speakers.
def impact():
    d = 3.2
    t = times(d)
    f = 34 + 62 * np.exp(-t / 0.16)
    sub = tone(f) * env(d, 0.002, 0.85)
    knock = 0.8 * tone(62 + 70 * np.exp(-t / 0.03)) * env(d, 0.001, 0.12)
    body = np.tanh(2.6 * (sub + knock))
    body += 0.3 * tone(2 * f) * env(d, 0.002, 0.5)
    dark = filt(noise(d), "lowpass", 500) * env(d, 0.001, 0.08) * 0.5
    crack = filt(noise(d), "lowpass", 1200) * env(d, 0.0005, 0.02) * 0.2
    x = reverb(body + dark + crack, 0.15, HALL)
    return np.tanh(1.3 * x) / np.tanh(1.3)


# Glow on "presence.": a soft high glint and air.
def shimmer():
    d = 2.0
    t = times(d)
    swell = bell(d, 0.3)
    air = filt(noise(d), "bandpass", [6500, 11000]) * 0.05
    ping = sum(
        a * np.sin(2 * np.pi * f * t + p)
        for f, a, p in [(2637, 0.10, 0), (3951, 0.06, 1.1), (5274, 0.03, 2.3)]
    )
    trem = 1 + 0.15 * np.sin(2 * np.pi * 5.5 * t)
    return reverb((air + ping * trem) * swell, 0.35, HALL)


# Into the end card: a lifting riser that cuts on the downbeat.
def riser():
    d = 0.8
    t = times(d) / d
    n = svf(noise(d), sweep(d, 300, 9000, 1.6), 0.8, "lp")
    lift = 0.2 * tone(sweep(d, 200, 760, 1.4))
    amp = t**2 * np.clip((1 - t) / 0.02, 0, 1)
    return pan((n + lift) * amp, np.linspace(-0.3, 0.3, len(n)))


# End card sting: a soft mallet chord over a gentle sub.
def sting():
    d = 4.0
    t = times(d)
    notes = [146.83, 220.0, 329.63, 369.99, 554.37]  # D maj9 voicing
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for i, f in enumerate(notes):
        for detune, side in [(0.997, left), (1.003, right)]:
            ff = f * detune
            v = (
                np.sin(2 * np.pi * ff * t)
                + 0.3 * np.sin(2 * np.pi * 2 * ff * t) * np.exp(-t / 0.4)
                + 0.1 * np.sin(2 * np.pi * 3 * ff * t) * np.exp(-t / 0.2)
            )
            side += v * env(d, 0.012 + i * 0.006, 1.3) / len(notes)
    sub = hit(0.15)[: len(t), 0]
    sub = 0.45 * sub / np.max(np.abs(sub))
    x = stereo(left + sub, right + sub)
    return reverb(x, 0.35, HALL)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    save("word-tick", word_tick())
    save("serif-tock", serif_tock())
    save("tap", tap())
    save("pop-low", pop(260, 0.6, 0.07))
    save("pop-1", pop(523.25))
    save("pop-2", pop(659.25))
    save("pop-3", pop(783.99))
    save("pop-cta", pop(698.46, 0.7, 0.05))
    save("bloom", bloom())
    save("type", np.concatenate([type_tick(f) for f in [3100]]))
    save("morph", morph())
    save("swipe", swipe())
    save("expand", expand())
    save("chime", chime())
    save("dive", dive())
    save("hit", impact())
    save("shimmer", shimmer())
    save("riser", riser())
    save("sting", sting())
