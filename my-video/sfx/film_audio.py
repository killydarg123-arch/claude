"""Scores the Onbaraka film: an ambient music bed plus restrained sound
design, mixed to one track at public/audio/film.wav.

Everything is synthesised here, so the brand owns it outright.
Run: python3 sfx/film_audio.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile

from dsp import (
    SR,
    bell,
    env,
    filt,
    make_ir,
    noise,
    pan,
    reverb,
    stereo,
    svf,
    sweep,
    times,
    tone,
)

OUT = Path(__file__).resolve().parent.parent / "public" / "audio" / "film.wav"
LENGTH = 22.5
N = int(LENGTH * SR)
rng = np.random.default_rng(11)

NOTE = {
    "E2": 82.41, "G2": 98.00, "A2": 110.00, "B2": 123.47, "D3": 146.83,
    "E3": 164.81, "F#3": 185.00, "G3": 196.00, "A3": 220.00, "B3": 246.94,
    "C#4": 277.18, "D4": 293.66, "E4": 329.63, "F#4": 369.99, "A4": 440.00,
    "B4": 493.88, "C#5": 554.37, "D5": 587.33, "E5": 659.25, "F#5": 739.99,
    "G5": 783.99, "A5": 880.00, "D2": 73.42, "B1": 61.74, "G1": 49.00,
    "E1": 41.20, "A1": 55.00,
}

# Chords follow the edit: title, solo, duo, pull back into the phone,
# the For You and Wishlist screens, then home on the wordmark.
CHORDS = [
    (0.0, 5.2, "D2", ["D3", "A3", "C#4", "E4", "F#4"]),
    (5.2, 8.7, "B1", ["F#3", "B3", "C#4", "D4", "F#4"]),
    (8.7, 14.05, "G1", ["G3", "B3", "D4", "F#4", "A4"]),
    (14.05, 16.45, "E2", ["E3", "G3", "B3", "D4", "F#4"]),
    (16.45, 19.35, "A1", ["A3", "C#4", "E4", "F#4", "B4"]),
    (19.35, LENGTH, "D2", ["D3", "A3", "C#4", "E4", "F#4"]),
]

# Sparse glass piano: one note every beat or so, landing on the cuts.
MELODY = [
    (0.25, "F#5", 0.8), (1.55, "E5", 0.6), (2.85, "A4", 0.55),
    (5.25, "D5", 0.7), (6.5, "C#5", 0.55), (7.8, "F#4", 0.5),
    (8.75, "B4", 0.65), (10.4, "A4", 0.7), (11.7, "F#5", 0.55), (13.0, "D5", 0.5),
    (14.05, "G5", 0.6), (15.3, "F#5", 0.5),
    (16.45, "E5", 0.6), (17.75, "C#5", 0.5),
    (19.35, "D5", 0.85), (19.36, "A5", 0.45), (20.2, "F#5", 0.55), (21.1, "E5", 0.4),
]

ATTACK = 1.2
RELEASE = 1.6


def place(track, x, at):
    """Add x (mono or stereo) into the stereo track starting at `at` seconds."""
    if x.ndim == 1:
        x = stereo(x)
    i = int(at * SR)
    j = min(N, i + len(x))
    if j > i:
        track[i:j] += x[: j - i]


def chord_envelope(start, end):
    """Raised cosine in and out, overlapping its neighbours."""
    dur = end - start + RELEASE
    t = times(dur)
    up = np.sin(np.clip(t / ATTACK, 0, 1) * np.pi / 2) ** 2
    down = np.cos(np.clip((t - (end - start)) / RELEASE, 0, 1) * np.pi / 2) ** 2
    return up * down


def pad_voice(freq, samples, cutoff, detune):
    """Soft saw: band limited partials shaped by a gentle low pass."""
    t = np.arange(samples) / SR
    f = freq * detune
    x = np.zeros_like(t)
    breathe = 1 + 0.25 * np.sin(2 * np.pi * 0.11 * t + rng.uniform(0, 6))
    for n in range(1, 16):
        if n * f > 7000:
            break
        response = 1 / np.sqrt(1 + (n * f / (cutoff * breathe)) ** 4)
        x += np.sin(2 * np.pi * n * f * t + rng.uniform(0, 2 * np.pi)) * response / n
    return x


def music():
    pad = np.zeros((N, 2))
    sub = np.zeros((N, 2))
    for start, end, root, notes in CHORDS:
        lead_in = 0.4 if start > 0 else 0
        s = max(0, start - lead_in)
        e = min(LENGTH, end)
        shape = chord_envelope(s, e)
        samples = len(shape)
        left = sum(pad_voice(NOTE[n], samples, 1800, 0.9965) for n in notes)
        right = sum(pad_voice(NOTE[n], samples, 1800, 1.0035) for n in notes)
        place(pad, stereo(left * shape, right * shape), s)
        low = np.sin(2 * np.pi * NOTE[root] * np.arange(samples) / SR) * shape
        place(sub, low, s)

    keys = np.zeros((N, 2))
    for at, name, velocity in MELODY:
        f = NOTE[name]
        d = 3.0
        t = times(d)
        x = (
            np.sin(2 * np.pi * f * t) * np.exp(-t / 1.6)
            + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.8)
            + 0.12 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.4)
            + 0.05 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t / 0.2)
        )
        x *= np.clip(t / 0.004, 0, 1) * velocity
        place(keys, pan(filt(x, "lowpass", 6500), rng.uniform(-0.25, 0.25)), at)

    air = filt(rng.standard_normal(N), "bandpass", [3000, 8000])
    air_bed = stereo(air, np.roll(air, 2400)) * 0.5

    hall = make_ir(3.2, 0.95)
    pad = np.stack([filt(pad[:, c], "highpass", 110) for c in range(2)], axis=1)
    pad = reverb(pad, 0.35, hall)[:N]
    keys = reverb(keys, 0.55, hall)[:N]
    return pad, sub, keys, air_bed


def air_swell(dur, rise=0.5):
    n = svf(noise(dur), sweep(dur, 600, 3200, 0.8), 1.4)
    return filt(n, "lowpass", 7000) * bell(dur, rise)


def pull_back():
    """Long breath as the camera pulls out of the photo into the phone."""
    d = 2.6
    left = air_swell(d, 0.55)
    right = air_swell(d, 0.55)
    sub = 0.6 * tone(sweep(d, 52, 40)) * bell(d, 0.6)
    return reverb(stereo(left + sub, right + sub), 0.2)


def swipe():
    d = 0.9
    n = svf(noise(d), sweep(d, 2200, 700, 0.8), 1.6) * env(d, 0.08, 0.22)
    return reverb(pan(filt(n, "lowpass", 6000), np.linspace(0.5, -0.5, len(n))), 0.15)


def drop():
    """Phone leaving frame: a soft falling breath."""
    d = 1.3
    n = svf(noise(d), sweep(d, 2400, 400, 1.2), 1.2) * bell(d, 0.35)
    return reverb(filt(n, "lowpass", 6000), 0.2)


def landing():
    """Wordmark: a warm, round low swell, not an impact."""
    d = 4.0
    t = times(d)
    f = 58 + 14 * np.exp(-t / 0.5)
    body = np.tanh(1.6 * tone(f) * env(d, 0.03, 1.2))
    body += 0.35 * tone(2 * f) * env(d, 0.03, 0.8)
    shimmer = filt(noise(d), "bandpass", [5000, 10000]) * bell(d, 0.25) * 0.05
    return reverb(body + shimmer, 0.25, make_ir(2.4, 0.7))


def rms(x):
    return np.sqrt(np.mean(x**2)) + 1e-12


def level(x, db):
    """Scale a stem so its RMS (over its active part) sits at `db` dBFS."""
    active = x[np.abs(x).max(axis=1) > 1e-4] if x.ndim == 2 else x
    return x * (10 ** (db / 20) / rms(active))


if __name__ == "__main__":
    pad, sub, keys, air_bed = music()
    mix = level(pad, -24) + level(sub, -36) + level(keys, -22) + level(air_bed, -48)

    sfx = np.zeros((N, 2))
    place(sfx, level(air_swell(1.4), -30), 1.6)
    place(sfx, level(air_swell(1.2, 0.45), -30), 4.85)
    place(sfx, level(pull_back(), -24), 8.4)
    place(sfx, level(swipe(), -32), 13.95)
    place(sfx, level(swipe(), -32), 16.35)
    place(sfx, level(drop(), -29), 18.5)
    place(sfx, level(landing(), -22), 19.3)
    mix += sfx

    t = times(LENGTH)
    mix *= np.clip(t / 0.3, 0, 1)[:, None] * np.clip((LENGTH - t) / 1.4, 0, 1)[:, None]
    mix = np.stack([filt(mix[:, c], "highpass", 40) for c in range(2)], axis=1)
    mix *= 0.89 / np.max(np.abs(mix))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT, SR, (mix * 32767).astype(np.int16))
    print(f"{OUT.name}: {LENGTH}s, peak -1 dBFS, rms {20 * np.log10(rms(mix)):.1f} dBFS")
